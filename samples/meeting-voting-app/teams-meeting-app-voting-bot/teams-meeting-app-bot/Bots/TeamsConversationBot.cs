// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Teams;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Bot.Schema;
using Microsoft.Bot.Schema.Teams;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using TeamsMeetingAppBot.Repository;
using TeamsMeetingAppBot.Repository.Model;

namespace TeamsMeetingAppBot.Bots
{
    public class TeamsConversationBot : TeamsActivityHandler
    {
        private string _appId;
        private string _appPassword;

        private IMeetingsRepository _meetingsRepository;
        private Services.VotingService _votingService;

        public TeamsConversationBot(IConfiguration config,
            Services.VotingService votingService,
            IMeetingsRepository meetingsRepository)
        {
            _appId = config["MicrosoftAppId"] ?? config["AzureAd:ClientId"];
            _appPassword = config["MicrosoftAppPassword"] ?? config["AzureAd:ClientSecret"];

            _meetingsRepository = meetingsRepository;
            _votingService = votingService;
        }

        protected override async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
        {
            // Send a welcome message to let people know that the Bot is now "monitoring" the meeting
            await turnContext.SendActivityAsync(MessageFactory.Text($"Hi, I'm your meeting Bot, and I will be happy to assist you before, during, and after this meeting!"), cancellationToken);
        }

        protected override async Task<AdaptiveCardInvokeResponse> OnAdaptiveCardInvokeAsync(ITurnContext<IInvokeActivity> turnContext, AdaptiveCardInvokeValue invokeValue, CancellationToken cancellationToken)
        {
            string meetingId = turnContext.Activity.ChannelData.meeting.id;
            string upn = await _votingService.ResolveUserUpnAsync(turnContext.Activity.From.AadObjectId);
            string topicId = invokeValue.Action.Data != null ? (string)((JObject)invokeValue.Action.Data)["topicId"] : null;
            string vote = invokeValue.Action.Verb;

            await _votingService.SaveVote(meetingId, topicId, upn, vote, turnContext.Activity.ReplyToId);

            return new AdaptiveCardInvokeResponse()
            {
                StatusCode = 200,
                Type = "application/vnd.microsoft.activity.message",
                Value = "I've got your vote!"
            };
        }

        protected override async Task OnTeamsMembersAddedAsync(IList<TeamsChannelAccount> membersAdded, TeamInfo teamInfo, ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            // Always update the meeting and its participants
            await UpdateMeetingWithParticipants(turnContext, cancellationToken);

            foreach (var teamMember in membersAdded)
            {
                if (teamMember.Id == turnContext.Activity.Recipient.Id)
                {
                    // Send a welcome message to let people know that the Bot is now "monitoring" the meeting
                    await turnContext.SendActivityAsync(MessageFactory.Text($"Hi, I'm your meeting Bot, and I will be happy to assist you before, during, and after this meeting!"), cancellationToken);
                }
            }
        }

        protected override async Task OnTeamsMembersRemovedAsync(IList<TeamsChannelAccount> membersRemoved, TeamInfo teamInfo, ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            bool updateMeeting = true;

            foreach (TeamsChannelAccount member in membersRemoved)
            {
                if (member.Id == turnContext.Activity.Recipient.Id)
                {
                    updateMeeting = false;

                    // The bot was removed, so we need to remove meeting's data from the persistence storage
                    await _meetingsRepository.DeleteMeetingAsync((string)turnContext.Activity.ChannelData.meeting.id);
                }
            }

            if (updateMeeting)
            {
                await UpdateMeetingWithParticipants(turnContext, cancellationToken);
            }
        }

        private async Task UpdateMeetingWithParticipants(ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            // We've just been added to the meeting conversation, so we need to store data in the persistence storage
            var meeting = new Meeting
            {
                MeetingId = (string)turnContext.Activity.ChannelData.meeting.id,
                ConversationId = turnContext.Activity.Conversation.Id,
                TenantId = turnContext.Activity.Conversation.TenantId,
                ServiceUrl = turnContext.Activity.ServiceUrl,
                Participants = new List<MeetingParticipant>()
            };

            var members = await GetPagedMembers(turnContext, cancellationToken);

            foreach (var m in members)
            {
                try
                {
                    var participant = await TeamsInfo.GetMeetingParticipantAsync(turnContext,
                        (string)turnContext.Activity.ChannelData.meeting.id,
                        m.Id,
                        turnContext.Activity.Conversation.TenantId,
                        cancellationToken);

                    meeting.Participants.Add(new MeetingParticipant
                    {
                        ParticipantId = Guid.NewGuid(),
                        ObjectId = m.AadObjectId,
                        Role = (MeetingParticipantRole)Enum.Parse(typeof(MeetingParticipantRole), participant.Meeting.Role),
                        InMeeting = participant.Meeting.InMeeting.HasValue ? participant.Meeting.InMeeting.Value : false,
                        UserPrincipalName = participant.User.UserPrincipalName.ToLower()
                    });
                }
                catch (Exception ex)
                {
                    // TODO: Handle exception
                }
            }

            // Save the meeting on the back-end repository
            await _meetingsRepository.SaveMeetingAsync(meeting);
        }

        private static async Task<List<TeamsChannelAccount>> GetPagedMembers(ITurnContext turnContext, CancellationToken cancellationToken)
        {
            var members = new List<TeamsChannelAccount>();
            string continuationToken = null;

            do
            {
                var currentPage = await TeamsInfo.GetPagedMembersAsync(turnContext, 100, continuationToken, cancellationToken);
                continuationToken = currentPage.ContinuationToken;
                members = members.Concat(currentPage.Members).ToList();
            }
            while (continuationToken != null);

            return members;
        }
    }
}
