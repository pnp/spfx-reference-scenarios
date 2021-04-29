using AdaptiveCards.Templating;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TeamsMeetingAppBot.Utility
{
    public static class CardsUtility
    {
        public static string BuildCard(string cardTemplatePath, dynamic data)
        {
            // Load and parse the template
            var cardTemplateJson = System.IO.File.ReadAllText(cardTemplatePath);
            var template = new AdaptiveCardTemplate(cardTemplateJson);

            var voteCard = template.Expand(data);

            // Return the card
            return voteCard;
        }
    }
}
