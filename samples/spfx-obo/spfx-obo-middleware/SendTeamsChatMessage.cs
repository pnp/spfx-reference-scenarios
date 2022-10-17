using System.Net;
using System.Net.Http.Headers;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using System.Text;
using System.Text.Json;
using PnP.SPFxOBO.Middleware.FunctionsMiddleware;

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
        [FunctionAuthorize(Scopes = new string[] { "Middleware.Consume" }, RunOnBehalfOf = true)]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            _logger.LogInformation("SendTeamsChatMessage invoked!");

            // And get the OBO token from the context
            var principalFeature = req.FunctionContext.Features.Get<JwtPrincipalFeature>();

            // If we've got the OBO token
            if (principalFeature != null && !string.IsNullOrEmpty(principalFeature.OnBehalfOfToken))
            {
                // Build the Microsoft Graph SDK client
                var graphServiceClient = new GraphServiceClient(new DelegateAuthenticationProvider((requestMessage) =>
                {
                    requestMessage
                        .Headers
                        .Authorization = new AuthenticationHeaderValue("Bearer", principalFeature.OnBehalfOfToken);

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
                var response = req.CreateResponse(HttpStatusCode.Unauthorized);
                return response;
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
