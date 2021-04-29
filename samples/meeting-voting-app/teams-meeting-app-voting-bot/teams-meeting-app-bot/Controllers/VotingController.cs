using AdaptiveCards;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Connector;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TeamsMeetingAppBot.Models;
using TeamsMeetingAppBot.Repository;
using TeamsMeetingAppBot.Utility;
using System.Security.Claims;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using AdaptiveCards.Templating;

namespace TeamsMeetingAppBot.Controllers
{
    [Authorize("AADOAuth")]
    [ApiController]
    [Route("api/voting")]
    public class VotingController : ControllerBase
    {
        private IConfiguration _config;
        private IMeetingsRepository _meetingsRepository;
        private ProactiveMessaging _proactiveMessaging;
        private Services.VotingService _votingService;

        public VotingController(IConfiguration config,
            IMeetingsRepository meetingsRepository,
            ProactiveMessaging proactiveMessaging,
            Services.VotingService votingService)
        {
            if (config == null)
            {
                throw new ArgumentNullException(nameof(config));
            }

            if (meetingsRepository == null)
            {
                throw new ArgumentNullException(nameof(meetingsRepository));
            }

            if (proactiveMessaging == null)
            {
                throw new ArgumentNullException(nameof(proactiveMessaging));
            }

            if (votingService == null)
            {
                throw new ArgumentNullException(nameof(votingService));
            }

            _config = config;
            _meetingsRepository = meetingsRepository;
            _proactiveMessaging = proactiveMessaging;
            _votingService = votingService;
        }

        [HttpPost("{meetingId}/topics")]
        public async Task<IActionResult> AddVotingTopicAsync(string meetingId, [FromBody] string topic)
        {
            var createdTopic = await _votingService.AddVotingTopicAsync(
                meetingId,
                topic,
                (this.User?.FindFirstValue(ClaimTypes.Upn) ??
                            this.User?.FindFirstValue("preferred_username"))?.ToLower());

            return CreatedAtAction("GetTopic", 
                new { 
                    meetingId = meetingId, 
                    topicId = createdTopic.Id 
                },
                createdTopic);
        }

        [HttpGet("{meetingId}/topics")]
        public async Task<IActionResult> GetTopicsAsync(string meetingId)
        {
            var topics = await _votingService.GetTopicsAsync(meetingId);

            // Return the voting topics
            return Ok(topics );
        }

        [HttpGet("{meetingId}/topics/{topicId}")]
        public async Task<IActionResult> GetTopicAsync(string meetingId, string topicId)
        {
            var topic = await _votingService.GetTopicAsync(meetingId, topicId);

            // Return the voting topic
            return Ok(topic);
        }

        [HttpPut("{meetingId}/topics/{topicId}")]
        public async Task<IActionResult> UpdateTopicAsync(string meetingId, string topicId, [FromBody] string topic)
        {
            var updatedTopic = await _votingService.UpdateTopicAsync(
                meetingId,
                topicId,
                topic,
                (this.User?.FindFirstValue(ClaimTypes.Upn) ??
                            this.User?.FindFirstValue("preferred_username"))?.ToLower(),
                false,
                string.Empty,
                new VotingResults());

            // Confirm deletion
            return Ok(updatedTopic);
        }

        [HttpDelete("{meetingId}/topics/{topicId}")]
        public async Task<IActionResult> DeleteTopicAsync(string meetingId, string topicId)
        {
            await _votingService.DeleteTopicAsync(meetingId, topicId);

            // Confirm deletion
            return NoContent();
        }

        [HttpPost("{meetingId}/topics/{topicId}/launch")]
        public async Task<IActionResult> LaunchTopicAsync(string meetingId, string topicId)
        {
            var meeting = await _meetingsRepository.ReadMeetingAsync(meetingId);
            var topic = await _votingService.GetTopicAsync(meetingId, topicId);
            topic = await _votingService.UpdateTopicAsync(
                meetingId, 
                topicId, 
                topic.Topic, 
                topic.AuthorUpn, 
                true, 
                string.Empty,
                new VotingResults());

            await _votingService.SendVotingCardAsync(meeting, topic);

            return Ok();
        }

        [HttpPost("{meetingId}/topics/{topicId}/close")]
        public async Task<IActionResult> CloseTopicAsync(string meetingId, string topicId)
        {
            var meeting = await _meetingsRepository.ReadMeetingAsync(meetingId);
            var topic = await _votingService.GetTopicAsync(meetingId, topicId);
            topic = await _votingService.UpdateTopicAsync(
                meetingId, 
                topicId, 
                topic.Topic, 
                topic.AuthorUpn, 
                false,
                topic.ReplyId,
                topic.VotingResults);

            await _votingService.UpdateVotingCardAsync(meeting, topic, false);

            return Ok();
        }
    }
}
