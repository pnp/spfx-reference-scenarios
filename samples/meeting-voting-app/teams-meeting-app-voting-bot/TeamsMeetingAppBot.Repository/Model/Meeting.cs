using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TeamsMeetingAppBot.Repository.Model
{
    /// <summary>
    /// Defines a Teams Meeting object
    /// </summary>
    public class Meeting
    {
        /// <summary>
        /// The unique ID of the meeting
        /// </summary>
        public string MeetingId { get; set; }

        /// <summary>
        /// The conversation ID of the meeting
        /// </summary>
        public string ConversationId { get; set; }

        /// <summary>
        /// The refernce Tenant ID of the meeting
        /// </summary>
        public string TenantId { get; set; }

        /// <summary>
        /// The Service URL to interact with the meeting
        /// </summary>
        public string ServiceUrl { get; set; }

        /// <summary>
        /// Collection of participants of the meeting
        /// </summary>
        public ICollection<MeetingParticipant> Participants { get; set; }

        /// <summary>
        /// Concurrency check property
        /// </summary>
        public byte[] Timestamp { get; set; }
    }
}
