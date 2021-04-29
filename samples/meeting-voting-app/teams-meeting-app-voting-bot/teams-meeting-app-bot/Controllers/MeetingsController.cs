using AdaptiveCards;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Connector;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Threading.Tasks;
using TeamsMeetingAppBot.Models;
using TeamsMeetingAppBot.Repository;
using TeamsMeetingAppBot.Utility;

namespace TeamsMeetingAppBot.Controllers
{
    [Authorize("AADOAuth")]
    [ApiController]
    [Route("api/meetings")]
    public class MeetingsController : ControllerBase
    {
        private IMeetingsRepository _meetingsRepository;
        private ProactiveMessaging _proactiveMessaging;

        public MeetingsController(IConfiguration config,
            IMeetingsRepository meetingsRepository,
            ProactiveMessaging proactiveMessaging)
        {
            if (meetingsRepository == null)
            {
                throw new ArgumentNullException(nameof(meetingsRepository));
            }

            if (proactiveMessaging == null)
            {
                throw new ArgumentNullException(nameof(proactiveMessaging));
            }

            _meetingsRepository = meetingsRepository;
            _proactiveMessaging = proactiveMessaging;
        }

        [HttpGet("{meetingId}/participants")]
        public async Task<IActionResult> GetMeetingParticipantsAsync(string meetingId)
        {
            var meeting = await _meetingsRepository.ReadMeetingAsync(meetingId);
            return Ok(from p in meeting.Participants select new { p.ObjectId, p.UserPrincipalName, p.Role, p.InMeeting });
        }

        [HttpGet("{meetingId}/participants/{upn}")]
        public async Task<IActionResult> GetMeetingParticipantAsync(string meetingId, string upn)
        {
            var meeting = await _meetingsRepository.ReadMeetingAsync(meetingId);
            return Ok(from p in meeting.Participants where p.UserPrincipalName == upn.ToLower() select new { p.ObjectId, p.UserPrincipalName, p.Role, p.InMeeting });
        }

        [HttpPost("{meetingId}/sendText")]
        public async Task<IActionResult> SendTextAsync(string meetingId, [FromBody] Message message)
        {
            // Read the meeting object from the persistence storage
            var meeting = await _meetingsRepository.ReadMeetingAsync(meetingId);

            await _proactiveMessaging.SendTextMessageAsync(meeting.ServiceUrl, meeting.ConversationId, message);

            return Accepted();
        }

        [HttpPost("{meetingId}/sendCard")]
        public async Task<IActionResult> SendCardAsync(string meetingId, [FromBody] CardMessage message)
        {
            // Read the meeting object from the persistence storage
            var meeting = await _meetingsRepository.ReadMeetingAsync(meetingId);

            await _proactiveMessaging.SendCardMessageAsync(meeting.ServiceUrl, meeting.ConversationId, message);

            return Accepted();
        }

        [HttpPost("{meetingId}/sendNotification")]
        public async Task<IActionResult> SendNotificationAsync(string meetingId, [FromBody] NotificationMessage message)
        {
            // Read the meeting object from the persistence storage
            var meeting = await _meetingsRepository.ReadMeetingAsync(meetingId);

            await _proactiveMessaging.SendNotificationMessageAsync(meeting.ServiceUrl, meeting.ConversationId, message);

            return Accepted();
        }
    }
}
