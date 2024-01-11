using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Kiota.Abstractions.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PnP.Ace.ExpenseReport.Backend
{
    // This class is a wrapper for the Microsoft Graph API
    // See: https://developer.microsoft.com/en-us/graph
    public class SimpleGraphClient
    {
        private readonly string _token;

        public SimpleGraphClient(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                throw new ArgumentNullException(nameof(token));
            }

            _token = token;
        }

        public async Task SaveExpenseReportFile(ExpenseReport expenseReport, Stream fileStream)
        {
            var targetSiteId = Environment.GetEnvironmentVariable("TargetSiteId");
            var targetLibraryId = Environment.GetEnvironmentVariable("TargetLibraryId");

            try
            {
                var graphClient = GetAuthenticatedClient();

                var drive = await graphClient.Sites[targetSiteId]
                    .Drives[targetLibraryId]
                    .GetAsync(o => o.QueryParameters.Expand = new string[] { "list" });

                if (drive != null && drive.List != null)
                {
                    var targetFileName = $"{Guid.NewGuid()}-{expenseReport.ReceiptFileName}";

                    var uploadedFile = await graphClient.Drives[drive.Id]
                        .Root.ItemWithPath(targetFileName).Content
                        .PutAsync(fileStream);

                    var uploadedFileItem = await graphClient.Drives[drive.Id]
                        .Root.ItemWithPath(targetFileName).GetAsync(o => o.QueryParameters.Expand = new string[] { "listItem" });

                    if (uploadedFile != null && uploadedFileItem != null && uploadedFileItem.ListItem != null)
                    {
                        var fieldValues = new FieldValueSet
                        {
                            AdditionalData = new Dictionary<string, object> {
                                { "PnPExpenseReportDescription", expenseReport.Description },
                                { "PnPExpenseReportCategory", expenseReport.Category },
                                { "PnPExpenseReportDate", expenseReport.Date},
                            }
                        };

                        await graphClient.Sites[targetSiteId]
                            .Lists[drive.List.Id]
                            .Items[uploadedFileItem.ListItem.Id]
                            .Fields.PatchAsync(fieldValues);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        // Get an Authenticated Microsoft Graph client using the token issued to the user.
        private GraphServiceClient GetAuthenticatedClient()
        {
            var graphClient = new GraphServiceClient(new BaseBearerTokenAuthenticationProvider(new TokenProvider(_token)));
            return graphClient;
        }
    }

    public class TokenProvider : IAccessTokenProvider
    {
        private string _token { get; set; }

        public TokenProvider(string token)
        {
            _token = token;
        }

        public AllowedHostsValidator AllowedHostsValidator => throw new NotImplementedException();

        public Task<string> GetAuthorizationTokenAsync(Uri uri, Dictionary<string, object>? additionalAuthenticationContext = null, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_token);
        }
    }
}
