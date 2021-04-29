using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TeamsMeetingAppBot.Repository.Model;

namespace TeamsMeetingAppBot.Repository
{
    /// <summary>
    /// This interface provides the basics of a storage service for meetings data
    /// </summary>
    public interface IMeetingsRepository
    {
        /// <summary>
        /// Initializes the repository
        /// </summary>
        void Init();

        /// <summary>
        /// Registers or updated a meeting in the persistence storage
        /// </summary>
        /// <param name="meeting">The meeting to register or update</param>
        Task SaveMeetingAsync(Meeting meeting);

        /// <summary>
        /// Reads the data of a meeting
        /// </summary>
        /// <param name="meetingId">The ID of the meeting to read from the persistence storage</param>
        /// <returns>The Teams Meeting object</returns>
        Task<Meeting> ReadMeetingAsync(string meetingId);

        /// <summary>
        /// Deletes the data of a meeting
        /// </summary>
        /// <param name="meetingId">The ID of the meeting to delete from the persistence storage</param>
        Task DeleteMeetingAsync(string meetingId);
    }
}
