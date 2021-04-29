using AdaptiveCards;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Teams;
using Microsoft.Bot.Connector;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Bot.Schema;
using Microsoft.Bot.Schema.Teams;
using Microsoft.Extensions.Configuration;
using Polly;
using Polly.CircuitBreaker;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TeamsMeetingAppBot.Models;
using TeamsMeetingAppBot.Repository;
using TeamsMeetingAppBot.Utility;

namespace TeamsMeetingAppBot.Utility
{
    /// <summary>
    /// Utility class to manage proactive messaging to Microsoft Teams meetings
    /// </summary>
    public class ProactiveMessaging
    {
        private string _teamsManifestId;
        private string _appId;
        private string _appPassword;

        public ProactiveMessaging(IConfiguration config)
        {
            _teamsManifestId = config["TeamsManifestId"];
            _appId = config["MicrosoftAppId"] ?? config["AzureAd:ClientId"];
            _appPassword = config["MicrosoftAppPassword"] ?? config["AzureAd:ClientSecret"];
        }

        #region Retry Logic

        static readonly Random random = new Random();

        // Create the send policy for Microsoft Teams
        // For more information about these policies
        // see: http://www.thepollyproject.org/
        private static IAsyncPolicy CreatePolicy()
        {
            // Policy for handling the short-term transient throttling.
            // Retry on throttling, up to 3 times with a 2,4,8 second delay between with a 0-1s jitter.
            var transientRetryPolicy = Policy
                    .Handle<ErrorResponseException>(ex => ex.Message.Contains("429"))
                    .WaitAndRetryAsync(
                        retryCount: 3,
                        (attempt) => TimeSpan.FromSeconds(Math.Pow(2, attempt)) + TimeSpan.FromMilliseconds(random.Next(0, 1000)));

            // Policy to avoid sending even more messages when the long-term throttling occurs.
            // After 5 messages fail to send, the circuit breaker trips & all subsequent calls will throw
            // a BrokenCircuitException for 10 minutes.
            // Note, in this application this cannot trip since it only sends one message at a time!
            // This is left in for completeness / demonstration purposes.
            var circuitBreakerPolicy = Policy
                .Handle<ErrorResponseException>(ex => ex.Message.Contains("429"))
                .CircuitBreakerAsync(exceptionsAllowedBeforeBreaking: 5, TimeSpan.FromMinutes(10));

            // Policy to wait and retry when long-term throttling occurs. 
            // This will retry a single message up to 5 times with a 10 minute delay between each attempt.
            // Note, in this application this cannot trip since the circuit breaker above cannot trip.
            // This is left in for completeness / demonstration purposes.
            var outerRetryPolicy = Policy
                .Handle<BrokenCircuitException>()
                .WaitAndRetryAsync(
                    retryCount: 5,
                    (_) => TimeSpan.FromMinutes(10));

            // Combine all three policies so that it will first attempt to retry short-term throttling (inner-most)
            // After 15 (5 messages, 3 failures each) consecutive failed attempts to send a message it will trip the circuit breaker
            // which will fail all messages for the next ten minutes. It will attempt to send messages up to 5 times for a total
            // wait of 50 minutes before failing a message.
            return
                outerRetryPolicy.WrapAsync(
                    circuitBreakerPolicy.WrapAsync(
                        transientRetryPolicy));
        }

        readonly IAsyncPolicy RetryPolicy = CreatePolicy();

        internal Task SendWithRetries(Func<Task> callback)
        {
            return RetryPolicy.ExecuteAsync(callback);
        }

        #endregion

        /// <summary>
        /// Sends an Activity on a conversation of a Meeting
        /// </summary>
        /// <param name="serviceUrl">The URL of the target service</param>
        /// <param name="conversationId">The ID of the target conversation</param>
        /// <param name="activity">The Activity to send</param>
        /// <returns></returns>
        private async Task SendActivityAsync(string serviceUrl, string conversationId, Activity activity)
        {
            // Create the proactive channel back to Teams
            var credentials = new MicrosoftAppCredentials(_appId, _appPassword);
            var connectorClient = new ConnectorClient(new Uri(serviceUrl), credentials);

            await SendWithRetries(async () =>
                    await connectorClient.Conversations.SendToConversationAsync(conversationId, activity));
        }

        /// <summary>
        /// Sends an Activity on a conversation of a Meeting
        /// </summary>
        /// <param name="serviceUrl">The URL of the target service</param>
        /// <param name="conversationId">The ID of the target conversation</param>
        /// <param name="activity">The Activity to send</param>
        /// <returns></returns>
        private async Task UpdateActivityAsync(string serviceUrl, string conversationId, Activity activity)
        {
            // Create the proactive channel back to Teams
            var credentials = new MicrosoftAppCredentials(_appId, _appPassword);
            var connectorClient = new ConnectorClient(new Uri(serviceUrl), credentials);

            await SendWithRetries(async () =>
                    await connectorClient.Conversations.UpdateActivityAsync(conversationId, activity.Id, activity));
        }

        /// <summary>
        /// Prepares a basic Activity for a conversation
        /// </summary>
        /// <param name="message">The message object to start from</param>
        /// <returns>The base activity</returns>
        private Activity BuildBaseActivity(Message message)
        {
            var activity = MessageFactory.Text(message.Text);
            activity.Summary = message.Summary;

            return activity;
        }

        /// <summary>
        /// Sends a Text Message Activity to a conversation of a Meeting
        /// </summary>
        /// <param name="serviceUrl">The URL of the target service</param>
        /// <param name="conversationId">The ID of the target conversation</param>
        /// <param name="message">The Text Message to send</param>
        /// <returns></returns>
        internal async Task SendTextMessageAsync(string serviceUrl, string conversationId, Message message)
        {
            var activity = BuildBaseActivity(message);

            await SendActivityAsync(serviceUrl, conversationId, activity);
        }

        /// <summary>
        /// Sends an Adaptive Card Message Activity to a conversation of a Meeting
        /// </summary>
        /// <param name="serviceUrl">The URL of the target service</param>
        /// <param name="conversationId">The ID of the target conversation</param>
        /// <param name="message">The Adaptive Card Message to send</param>
        /// <returns></returns>
        internal async Task SendCardMessageAsync(string serviceUrl, string conversationId, CardMessage message)
        {
            var activity = BuildBaseActivity(message);

            if (!string.IsNullOrEmpty(message.Card))
            {
                AdaptiveCard card = AdaptiveCard.FromJson(message.Card).Card;

                // Create the attachment.
                Attachment attachment = new Attachment()
                {
                    ContentType = AdaptiveCard.ContentType,
                    Content = card
                };

                activity.Attachments.Add(attachment);
            }

            await SendActivityAsync(serviceUrl, conversationId, activity);
        }

        /// <summary>
        /// Sends an updated Adaptive Card Message Activity to a conversation of a Meeting
        /// </summary>
        /// <param name="serviceUrl">The URL of the target service</param>
        /// <param name="conversationId">The ID of the target conversation</param>
        /// <param name="replyToId">The ID of the card to reply to</param>
        /// <param name="message">The Adaptive Card Message to send</param>
        /// <returns></returns>
        internal async Task UpdateCardMessageAsync(string serviceUrl, string conversationId, string replyToId, CardMessage message)
        {
            var activity = BuildBaseActivity(message);

            if (!string.IsNullOrEmpty(message.Card))
            {
                AdaptiveCard card = AdaptiveCard.FromJson(message.Card).Card;

                // Create the attachment.
                Attachment attachment = new Attachment()
                {
                    ContentType = AdaptiveCard.ContentType,
                    Content = card
                };

                activity.Attachments.Add(attachment);
            }

            activity.Id = replyToId;

            await UpdateActivityAsync(serviceUrl, conversationId, activity);
        }

        /// <summary>
        /// Sends a Notification Message Activity to a conversation of a Meeting
        /// </summary>
        /// <param name="serviceUrl">The URL of the target service</param>
        /// <param name="conversationid">The ID of the target conversation</param>
        /// <param name="message">The Notification Message to send</param>
        /// <returns></returns>
        internal async Task SendNotificationMessageAsync(string serviceUrl, string conversationid, NotificationMessage message)
        {
            var activity = BuildBaseActivity(message);
            activity.TeamsNotifyUser(true, $"https://teams.microsoft.com/l/bubble/{_teamsManifestId}?url={message.NotificationUrl}&height={message.Height}&width={message.Width}&title={message.Title}&completionBotId={_appId}");

            await SendActivityAsync(serviceUrl, conversationid, activity);
        }
    }
}
