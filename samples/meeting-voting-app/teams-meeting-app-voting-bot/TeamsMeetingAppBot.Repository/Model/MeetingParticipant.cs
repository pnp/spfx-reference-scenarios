using System;
using System.Collections.Generic;
using System.Text;

namespace TeamsMeetingAppBot.Repository.Model
{
    /// <summary>
    /// Defines a Teams Meeting participant
    /// </summary>
    public class MeetingParticipant
    {
        /// <summary>
        /// Unique ID of the Teams Meeting Participant
        /// </summary>
        public Guid ParticipantId { get; set; }

        /// <summary>
        /// The unique ID of the participant in Azure Active Directory
        /// </summary>
        public string ObjectId { get; set; }

        /// <summary>
        /// The UPN of the participant
        /// </summary>
        public string UserPrincipalName { get; set; }

        /// <summary>
        /// The role of the participant in the meeting
        /// </summary>
        public MeetingParticipantRole Role { get; set; }

        /// <summary>
        /// Defines whether the participant is online in the meeting, or not
        /// </summary>
        public bool InMeeting { get; set; }

        /// <summary>
        /// Maps the participant to the corresponding meeting
        /// </summary>
        public Meeting Meeting { get; set; }

        /// <summary>
        /// Concurrency check property
        /// </summary>
        public byte[] Timestamp { get; set; }
    }

    /// <summary>
    /// Defines the Role of a Teams Meeting participant
    /// </summary>
    public enum MeetingParticipantRole
    {
        /// <summary>
        /// Simple attendee of a meeting
        /// </summary>
        Attendee,
        /// <summary>
        /// Presenter of a meeting
        /// </summary>
        Presenter,
        /// <summary>
        /// Organizer of a meeting
        /// </summary>
        Organizer,
    }
}
