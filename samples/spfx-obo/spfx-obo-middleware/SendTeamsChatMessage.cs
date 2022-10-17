using System.Net;
using System.Net.Http.Headers;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using System.Text;
using System.Text.Json;

namespace PnP.SPFxOBO.Middleware
{
    public class SendTeamsChatMessage
    {
        private readonly ILogger _logger;

        public SendTeamsChatMessage(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<SendTeamsChatMessage>();
        }

        [Function("SendTeamsChatMessage")]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            _logger.LogInformation("SendTeamsChatMessage invoked!");

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

                // IMPORTANT: This is just for the sake of demo purposes, don't do that in real projects!
                _logger.LogInformation($"OBO Access Token: {oboAccessToken}");

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

                    // Deserialize the request
                    var body = await DeserializeJsonStringAsync<SendTeamsChatMessageRequest>(
                        await req.ReadAsStringAsync());

                    // Create the new chat
                    var chat = new Chat
                    {
                        ChatType = ChatType.OneOnOne,
                        Members = new ChatMembersCollectionPage()
                    };

                    // Add myself to the chat
                    var me = await graphServiceClient.Me.Request().GetAsync();
                    chat.Members.Add(new AadUserConversationMember
                    {
                        Roles = new List<String>()
                        {
                            "owner"
                        },
                        AdditionalData = new Dictionary<string, object>()
                        {
                            {"user@odata.bind", $"https://graph.microsoft.com/v1.0/users('{me.Id}')"}
                        }
                    });

                    // Add the other user to the chat
                    var user = await graphServiceClient.Users[body.MessageTo].Request().GetAsync();
                    chat.Members.Add(new AadUserConversationMember
                    {
                        Roles = new List<String>()
                        {
                            "owner"
                        },
                        AdditionalData = new Dictionary<string, object>()
                        {
                            {"user@odata.bind", $"https://graph.microsoft.com/v1.0/users('{user.Id}')"}
                        }
                    });

                    // Send the chat group creation request
                    var createdChat = await graphServiceClient.Chats
                        .Request()
                        .AddAsync(chat);

                    // Build the chat message to send
                    var chatMessage = new ChatMessage
                    {
                        Body = new ItemBody
                        {
                            Content = body.Message,
                            ContentType = BodyType.Html
                        }
                    };

                    // And send the message to the chat group
                    await graphServiceClient.Chats[createdChat.Id].Messages
                        .Request()
                        .AddAsync(chatMessage);

                    // Build and send the response
                    var response = req.CreateResponse(HttpStatusCode.OK);
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

        private static async Task<TResult> DeserializeJsonStringAsync<TResult>(string input)
        {
            if (input == null)
            {
                throw new ArgumentNullException(nameof(input));
            }

            var inputBytes = Encoding.UTF8.GetBytes(input);

            var mem = new MemoryStream();
            mem.Write(inputBytes, 0, inputBytes.Length);
            mem.Position = 0;

            return await JsonSerializer.DeserializeAsync<TResult>(mem, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            });
        }
    }
}
