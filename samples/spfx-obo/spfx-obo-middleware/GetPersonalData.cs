using System.Net;
using System.Net.Http.Headers;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;

namespace PnP.SPFxOBO.Middleware
{
    public class GetPersonalData
    {
        private readonly ILogger _logger;

        public GetPersonalData(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<GetPersonalData>();
        }

        [Function("GetPersonalData")]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _logger.LogInformation("GetPersonalData invoked!");

            if (!req.Headers.Contains("Authorization")) 
            {
                var missingAuthorizationHeaderResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                return missingAuthorizationHeaderResponse;
            }
            else
            {
                // Get the Access Token from the Authorization header
                var authorizationHeader = req.Headers.GetValues("Authorization");
                var bearerToken = authorizationHeader.First().Split(" ")[1];

                // And retrieve the OBO token from there
                var oboAccessToken = await SecurityHelper.GetOboToken(bearerToken);

                // If we've got the OBO token
                if (!string.IsNullOrEmpty(oboAccessToken))
                {
                    // Build the Microsoft Graph SDK client
                    var graphServiceClient = new GraphServiceClient(new DelegateAuthenticationProvider((requestMessage) =>
                    {
                        requestMessage
                            .Headers
                            .Authorization = new AuthenticationHeaderValue("Bearer", oboAccessToken);

                        return Task.CompletedTask;
                    }));

                    // Get info about the current user
                    var me = await graphServiceClient.Me.Request().GetAsync();

                    // Get the user's inbox
                    var inbox = await graphServiceClient.Me.MailFolders.Inbox.Request().GetAsync();

                    // Build the response
                    var response = req.CreateResponse(HttpStatusCode.OK);
                    await response.WriteAsJsonAsync(new {
                        UserPrincipalName = me.UserPrincipalName,
                        InboxUnreadItemCount = inbox.UnreadItemCount,
                        InboxTotalItemCount = inbox.TotalItemCount
                    });

                    return response;
                }
                else 
                {
                var noObOTokenResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                noObOTokenResponse.WriteString("Unable to retrieve an on-behalf-of token!");
                return noObOTokenResponse;
                }
            }
        }
    }
}
