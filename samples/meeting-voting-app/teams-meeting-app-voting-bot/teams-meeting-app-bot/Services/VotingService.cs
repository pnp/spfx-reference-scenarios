using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using TeamsMeetingAppBot.Models;
using TeamsMeetingAppBot.Repository;
using TeamsMeetingAppBot.Repository.Model;
using TeamsMeetingAppBot.Utility;

namespace TeamsMeetingAppBot.Services
{
    /// <summary>
    /// Service for managing voting of topics
    /// </summary>
    public class VotingService
    {
        private IConfiguration _config;
        private GraphServiceClient _graphClient;
        private IMeetingsRepository _meetingsRepository;
        private ProactiveMessaging _proactiveMessaging;
        private IWebHostEnvironment _hostEnv;

        private string _spoTenant;
        private string _spoSiteRelativeUrl;
        private string _spoVotesListId;
        private string _spoVotingTopicsListId;
        private string _cardOpenForVotingPath;
        private string _cardClosedForVotingPath;

        public VotingService(IConfiguration config,
            GraphServiceClient graphClient,
            IMeetingsRepository meetingsRepository,
            ProactiveMessaging proactiveMessaging,
            IWebHostEnvironment hostEnv)
        {
            if (config == null)
            {
                throw new ArgumentNullException(nameof(config));
            }

            if (graphClient == null)
            {
                throw new ArgumentNullException(nameof(graphClient));
            }

            if (meetingsRepository == null)
            {
                throw new ArgumentNullException(nameof(meetingsRepository));
            }

            if (proactiveMessaging == null)
            {
                throw new ArgumentNullException(nameof(proactiveMessaging));
            }

            if (hostEnv == null)
            {
                throw new ArgumentNullException(nameof(hostEnv));
            }

            _config = config;
            _graphClient = graphClient;
            _meetingsRepository = meetingsRepository;
            _proactiveMessaging = proactiveMessaging;
            _hostEnv = hostEnv;

            // Read SPO configuration settings
            _spoTenant = _config["SpoTenant"];
            _spoSiteRelativeUrl = _config["SpoSiteRelativeUrl"];

            var listsIds = LoadListsId().GetAwaiter().GetResult();
            _spoVotingTopicsListId = listsIds.Item1;
            _spoVotesListId = listsIds.Item2;

            // Build the cards paths variable
            _cardOpenForVotingPath = _hostEnv.ContentRootPath
                + Path.DirectorySeparatorChar.ToString()
                + "Cards"
                + Path.DirectorySeparatorChar.ToString()
                + "card-OpenForVoting.json";
            _cardClosedForVotingPath = _hostEnv.ContentRootPath
                + Path.DirectorySeparatorChar.ToString()
                + "Cards"
                + Path.DirectorySeparatorChar.ToString()
                + "card-ClosedForVoting.json";
        }

        #region Voting Topic management section

        public async Task<VotingTopic> AddVotingTopicAsync(string meetingId, string topic, string userUpn)
        {
            // Set fields for the target item
            var votingTopic = new ListItem
            {
                Fields = new FieldValueSet
                {
                    AdditionalData = new Dictionary<string, object>()
                    {
                        {"Title", topic},
                        {"MeetingId", meetingId},
                        {"AuthorUpn", userUpn },
                        {"OpenForVoting", false },
                        {"ReplyId", string.Empty},
                        {"VotingResults", "{}"},
                    }
                }
            };

            // Add the new topic to the target list
            votingTopic = await _graphClient.Sites.GetByPath(_spoSiteRelativeUrl, _spoTenant)
                .Lists[_spoVotingTopicsListId].Items
                .Request()
                .AddAsync(votingTopic);

            return new VotingTopic
            {
                Id = votingTopic.Id,
                Topic = GetListItemValue<string>(votingTopic, "Title"),
                MeetingId = GetListItemValue<string>(votingTopic, "MeetingId"),
                AuthorUpn = GetListItemValue<string>(votingTopic, "AuthorUpn"),
                OpenForVoting = GetListItemValue<bool>(votingTopic, "OpenForVoting"),
                ReplyId = GetListItemValue<string>(votingTopic, "ReplyId"),
                VotingResults = JsonConvert.DeserializeObject<VotingResults>(GetListItemValue<string>(votingTopic, "VotingResults")),
            };
        }

        public async Task<IEnumerable<VotingTopic>> GetTopicsAsync(string meetingId)
        {
            // Get the voting topics from the target list for the current meeting
            var topics = await _graphClient.Sites.GetByPath(_spoSiteRelativeUrl, _spoTenant)
                .Lists[_spoVotingTopicsListId].Items
                .Request()
                .Header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
                .Expand("fields")
                .Filter($"fields/MeetingId eq '{meetingId}'")
                .GetAsync();

            // Return the voting topics
            return (topics != null ? (from votingTopic in topics
                                      select
                                        new VotingTopic
                                        {
                                            Id = votingTopic.Id,
                                            Topic = GetListItemValue<string>(votingTopic, "Title"),
                                            MeetingId = GetListItemValue<string>(votingTopic, "MeetingId"),
                                            AuthorUpn = GetListItemValue<string>(votingTopic, "AuthorUpn"),
                                            OpenForVoting = GetListItemValue<bool>(votingTopic, "OpenForVoting"),
                                            ReplyId = GetListItemValue<string>(votingTopic, "ReplyId"),
                                            VotingResults = JsonConvert.DeserializeObject<VotingResults>(GetListItemValue<string>(votingTopic, "VotingResults")),
                                        }).ToList() : null);
        }

        public async Task<VotingTopic> GetTopicAsync(string meetingId, string topicId)
        {
            // Get the voting topics from the target list for the current meeting
            var votingTopic = await _graphClient.Sites.GetByPath(_spoSiteRelativeUrl, _spoTenant)
                .Lists[_spoVotingTopicsListId].Items[topicId]
                .Request()
                .Expand("fields")
                .GetAsync();

            // Return the voting topic
            return (votingTopic != null ? (new VotingTopic
            {
                Id = votingTopic.Id,
                Topic = GetListItemValue<string>(votingTopic, "Title"),
                MeetingId = GetListItemValue<string>(votingTopic, "MeetingId"),
                AuthorUpn = GetListItemValue<string>(votingTopic, "AuthorUpn"),
                OpenForVoting = GetListItemValue<bool>(votingTopic, "OpenForVoting"),
                ReplyId = GetListItemValue<string>(votingTopic, "ReplyId"),
                VotingResults = JsonConvert.DeserializeObject<VotingResults>(GetListItemValue<string>(votingTopic, "VotingResults")),
            }) : null);
        }

        public async Task<VotingTopic> UpdateTopicAsync(string meetingId, string topicId, string topic, string userUpn, bool openForVoting, string replyId, VotingResults votingResults)
        {
            // Set fields for the target item
            var votingTopic = new ListItem
            {
                Fields = new FieldValueSet
                {
                    AdditionalData = new Dictionary<string, object>()
                    {
                        {"Title", topic},
                        {"MeetingId", meetingId},
                        {"AuthorUpn", userUpn },
                        {"OpenForVoting", openForVoting },
                        {"ReplyId", replyId },
                        {"VotingResults", JsonConvert.SerializeObject(votingResults) }
                    }
                }
            };

            // Get the voting topics from the target list for the current meeting
            await _graphClient.Sites.GetByPath(_spoSiteRelativeUrl, _spoTenant)
                .Lists[_spoVotingTopicsListId].Items[topicId]
                .Request()
                .UpdateAsync(votingTopic);

            // Confirm deletion
            return new VotingTopic
            {
                Id = topicId,
                Topic = GetListItemValue<string>(votingTopic, "Title"),
                MeetingId = GetListItemValue<string>(votingTopic, "MeetingId"),
                AuthorUpn = GetListItemValue<string>(votingTopic, "AuthorUpn"),
                OpenForVoting = GetListItemValue<bool>(votingTopic, "OpenForVoting"),
                ReplyId = GetListItemValue<string>(votingTopic, "ReplyId"),
                VotingResults = JsonConvert.DeserializeObject<VotingResults>(GetListItemValue<string>(votingTopic, "VotingResults")),
            };
        }

        public async Task DeleteTopicAsync(string meetingId, string topicId)
        {
            // Get the voting topics from the target list for the current meeting
            await _graphClient.Sites.GetByPath(_spoSiteRelativeUrl, _spoTenant)
                .Lists[_spoVotingTopicsListId].Items[topicId]
                .Request()
                .DeleteAsync();
        }

        #endregion

        #region Votes management section

        public async Task SaveVote(string meetingId, string topicId, string userUpn, string vote, string replyId)
        {
            // Read meeting data
            var meeting = await _meetingsRepository.ReadMeetingAsync(meetingId);

            // Read the topic data
            var topic = await GetTopicAsync(meetingId, topicId);

            // Set fields for the target vote item to add/update
            var voteItem = new ListItem
            {
                Fields = new FieldValueSet
                {
                    AdditionalData = new Dictionary<string, object>()
                    {
                        {"Title", topic.Topic},
                        {"MeetingId", meetingId},
                        {"TopicId", topicId},
                        {"Voter", userUpn },
                        {"Vote", vote},
                    }
                }
            };

            // Let's see if we already have a vote for the current voter, meeting, and topic
            var existingVotes = await _graphClient.Sites.GetByPath(_spoSiteRelativeUrl, _spoTenant)
                .Lists[_spoVotesListId].Items
                .Request()
                .Header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
                .Expand("fields")
                .Filter($"fields/MeetingId eq '{meetingId}' and fields/TopicId eq '{topicId}' and fields/Voter eq '{userUpn}'")
                .GetAsync();

            if (existingVotes != null && existingVotes.Count > 0)
            {
                var existingVote = existingVotes[0];
                var existingVoteValue = GetListItemValue<string>(existingVote, "Vote");

                // Update the voting results
                switch (existingVoteValue)
                {
                    case "yes":
                        topic.VotingResults.Yes--;
                        if (topic.VotingResults.Yes < 0) { topic.VotingResults.Yes = 0; }
                        break;
                    case "no":
                        topic.VotingResults.No--;
                        if (topic.VotingResults.No < 0) { topic.VotingResults.No = 0; }
                        break;
                    case "pass":
                    default:
                        topic.VotingResults.Pass--;
                        if (topic.VotingResults.Pass < 0) { topic.VotingResults.Pass = 0; }
                        break;
                }

                // Update the existing vote item
                voteItem = await _graphClient.Sites.GetByPath(_spoSiteRelativeUrl, _spoTenant)
                    .Lists[_spoVotesListId].Items[existingVote.Id]
                    .Request()
                    .UpdateAsync(voteItem);
            }
            else
            {
                // Create a new vote item
                voteItem = await _graphClient.Sites.GetByPath(_spoSiteRelativeUrl, _spoTenant)
                    .Lists[_spoVotesListId].Items
                    .Request()
                    .AddAsync(voteItem);
            }

            // Update the voting results
            switch (vote)
            {
                case "yes":
                    topic.VotingResults.Yes++;
                    break;
                case "no":
                    topic.VotingResults.No++;
                    break;
                case "pass":
                default:
                    topic.VotingResults.Pass++;
                    break;
            }

            // Update the topic with the replyId
            topic = await UpdateTopicAsync(meetingId, topicId, topic.Topic, topic.AuthorUpn, topic.OpenForVoting, replyId, topic.VotingResults);

            await UpdateVotingCardAsync(meeting, topic);
        }

        #endregion

        #region Proactive Messaging logic

        public async Task SendVotingCardAsync(Meeting meeting, VotingTopic topic)
        {
            // Prepare card data
            var data = new
            {
                topic = topic.Topic,
                yes = 0,
                no = 0,
                pass = 0,
                voters = meeting.Participants.Count,
                votes = 0,
                topicId = topic.Id,
            };

            // Prepare the card message
            var message = new CardMessage
            {
                Card = CardsUtility.BuildCard(_cardOpenForVotingPath, data)
            };

            // Here we need to launch the topic
            await _proactiveMessaging.SendCardMessageAsync(meeting.ServiceUrl, meeting.ConversationId, message);
        }

        public async Task UpdateVotingCardAsync(Meeting meeting, VotingTopic topic, bool openForVoting = true)
        {
            // Prepare card data
            var data = new
            {
                topic = topic.Topic,
                yes = topic.VotingResults.Yes,
                no = topic.VotingResults.No,
                pass = topic.VotingResults.Pass,
                voters = meeting.Participants.Count,
                votes = topic.VotingResults.Yes + topic.VotingResults.No + topic.VotingResults.Pass,
                topicId = topic.Id,
            };

            // Prepare the card message
            var message = new CardMessage
            {
                Card = CardsUtility.BuildCard(openForVoting ? _cardOpenForVotingPath : _cardClosedForVotingPath, data)
            };

            // Here we need to launch the topic
            await _proactiveMessaging.UpdateCardMessageAsync(meeting.ServiceUrl, meeting.ConversationId, topic.ReplyId, message);
        }

        #endregion

        #region Misc supporting methods

        private async Task<Tuple<string, string>> LoadListsId()
        {
            // Read configuration settings
            var spoTenant = _spoTenant;
            var spoSiteRelativeUrl = _spoSiteRelativeUrl;
            var votingTopicsList = _config["VotingTopicsList"];
            var votesList = _config["VotesList"];

            var votingTopicsListId = string.Empty;
            var votesListId = string.Empty;

            // Build the batch
            var batchRequestContent = new BatchRequestContent();
            var votingTopicsListRequest = _graphClient.Sites.GetByPath(spoSiteRelativeUrl, spoTenant).Lists.Request().Filter($"DisplayName eq '{votingTopicsList}'").Select("Id");
            var votesListRequest = _graphClient.Sites.GetByPath(spoSiteRelativeUrl, spoTenant).Lists.Request().Filter($"DisplayName eq '{votesList}'").Select("Id");
            var votingTopicsListRequestId = batchRequestContent.AddBatchRequestStep(votingTopicsListRequest);
            var votesListRequestId = batchRequestContent.AddBatchRequestStep(votesListRequest);

            // Execute the batch request
            var returnedResponse = await _graphClient.Batch.Request().PostAsync(batchRequestContent);

            // Get a reference to the target lists
            var votingTopicsListIdResponse = await returnedResponse
                .GetResponseByIdAsync(votingTopicsListRequestId);
            if (votingTopicsListIdResponse.IsSuccessStatusCode)
            {
                var votingTopicsListIdJson = await votingTopicsListIdResponse.Content.ReadAsStringAsync();
                votingTopicsListId = JsonConvert.DeserializeAnonymousType(votingTopicsListIdJson,
                    new { value = new[] { new { id = "" } } })?.value[0]?.id;
            }
            var votesListIdResponse = await returnedResponse
                .GetResponseByIdAsync(votesListRequestId);
            if (votesListIdResponse.IsSuccessStatusCode)
            {
                var votesListIdJson = await votesListIdResponse.Content.ReadAsStringAsync();
                votesListId = JsonConvert.DeserializeAnonymousType(votesListIdJson,
                    new { value = new[] { new { id = "" } } })?.value[0]?.id;
            }

            return new Tuple<string, string>(votingTopicsListId, votesListId);
        }

        public async Task<string> ResolveUserUpnAsync(string aadUserId)
        {
            var user = await _graphClient.Users[aadUserId].Request().Select("userPrincipalName").GetAsync();
            return user?.UserPrincipalName?.ToLower();
        }

        private TResult GetListItemValue<TResult>(ListItem item, string fieldName)
        {
            if (item == null)
            {
                throw new ArgumentNullException(nameof(item));
            }

            return item.Fields.AdditionalData.ContainsKey(fieldName) ?
                (TResult)item.Fields.AdditionalData[fieldName] :
                default(TResult);
        }

        #endregion
    }
}
