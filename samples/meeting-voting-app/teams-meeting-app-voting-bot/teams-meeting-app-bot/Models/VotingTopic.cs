using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TeamsMeetingAppBot.Models
{
    /// <summary>
    /// Domain Model object describing a Voting Topic
    /// </summary>
    public class VotingTopic
    {
        /// <summary>
        /// The ID of the Voting Topic
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// The Topic to vote for
        /// </summary>
        public string Topic { get; set; }

        /// <summary>
        /// The Meeting Id
        /// </summary>
        public string MeetingId { get; set; }

        /// <summary>
        /// The Author of the Voting Topic
        /// </summary>
        public string AuthorUpn { get; set; }

        /// <summary>
        /// Defines whether the Voting Topic is open for voting
        /// </summary>
        public bool OpenForVoting { get; set; }

        /// <summary>
        /// The Id to use to Reply within the current Voting Topic session
        /// </summary>
        public string ReplyId { get; set; }

        /// <summary>
        /// The Id to use to Reply within the current Voting Topic session
        /// </summary>
        public VotingResults VotingResults { get; set; }
    }

    /// <summary>
    /// Defines the data structure to hold the voting results
    /// </summary>
    public class VotingResults
    {
        /// <summary>
        /// Number of Yes votes
        /// </summary>
        public int Yes { get; set; }

        /// <summary>
        /// Number of No votes
        /// </summary>
        public int No { get; set; }

        /// <summary>
        /// Number of Pass votes
        /// </summary>
        public int Pass { get; set; }
    }
}
