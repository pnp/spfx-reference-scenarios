using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TeamsMeetingAppBot.Models
{
    /// <summary>
    /// A basic Message for participants of a meeting
    /// </summary>
    public class Message
    {
        /// <summary>
        /// The Text of the message to send
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// The Summary of the message to send
        /// </summary>
        public string Summary { get; set; }
    }

    /// <summary>
    /// A Message with an Adaptive Card for participants of a meeting
    /// </summary>
    public class CardMessage: Message
    {
        /// <summary>
        /// JSON of an Adaptive Card to send
        /// </summary>
        public string Card { get; set; }
    }

    /// <summary>
    /// A Message with a Notification Signal for participants of a meeting
    /// </summary>
    public class NotificationMessage : Message
    {
        /// <summary>
        /// The URL to bubble up on the users' screen
        /// </summary>
        public string NotificationUrl { get; set; }

        /// <summary>
        /// Title of the Notification Popup Window
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// The height of the Notification Popup Window
        /// </summary>
        public int Height { get; set; }

        /// <summary>
        /// The height of the Notification Popup Window
        /// </summary>
        public int Width { get; set; }
    }
}
