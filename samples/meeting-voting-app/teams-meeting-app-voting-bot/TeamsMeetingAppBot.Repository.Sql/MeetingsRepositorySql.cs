using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using TeamsMeetingAppBot.Repository.Model;

namespace TeamsMeetingAppBot.Repository.Sql
{
    public class MeetingsRepositorySql : IMeetingsRepository
    {
        private MeetingsContext _meetingsContext;

        public MeetingsRepositorySql(MeetingsContext meetingsContext)
        {
            if (meetingsContext == null)
            {
                throw new ArgumentNullException(nameof(meetingsContext));
            }

            _meetingsContext = meetingsContext;
        }

        public void Init()
        {
            // Try to update or create the database
            _meetingsContext.Database.Migrate();
        }

        public async Task DeleteMeetingAsync(string meetingId)
        {
            var meeting = await _meetingsContext.Meetings
                .FirstOrDefaultAsync(m => m.MeetingId == meetingId);

            _meetingsContext.Meetings.Remove(meeting);
            await _meetingsContext.SaveChangesAsync();
        }

        public async Task<Meeting> ReadMeetingAsync(string meetingId)
        {
            var meeting = await _meetingsContext.Meetings
                .Include(m => m.Participants)
                .FirstOrDefaultAsync(m => m.MeetingId == meetingId);

            return meeting;
        }

        public async Task SaveMeetingAsync(Meeting meeting)
        {
            var existing = await _meetingsContext.Meetings
                .Include(m => m.Participants)
                .FirstOrDefaultAsync(m => m.MeetingId == meeting.MeetingId);

            if (existing == null)
            {
                _meetingsContext.Meetings.Add(meeting);
            }
            else
            {
                existing.ConversationId = meeting.ConversationId;
                existing.TenantId = meeting.TenantId;
                existing.ServiceUrl = meeting.ServiceUrl;
                try
                {
                    foreach (var p in existing.Participants.ToArray())
                    {
                        existing.Participants.Remove(p);
                    }
                    foreach (var p in meeting.Participants)
                    {
                        _meetingsContext.MeetingParticipants.Add(p);
                        existing.Participants.Add(p);
                    }
                }
                catch (Exception ex)
                {

                }
            }

            await _meetingsContext.SaveChangesAsync();
        }
    }
}
