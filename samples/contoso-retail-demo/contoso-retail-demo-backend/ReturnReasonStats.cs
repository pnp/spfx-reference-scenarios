using System.Net;
using Contoso.Retail.Demo.Backend.FunctiosMiddleware;
using Contoso.Retail.Demo.Backend.Model;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace Contoso.Retail.Demo.Backend
{
    public class ReturnReasonStats
    {
        private readonly ILogger _logger;

        public ReturnReasonStats(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<ReturnReasonStats>();
        }

        [Function("ReturnReasonStats")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
        {
            _logger.LogInformation("ReturnReasonStats function triggered.");

            // Build the response content
            var responseContent = new ReturnReasons
                {
                    IncorrectFit = 15,
                    Defective = 65,
                    WrongItem = 5,
                    Disliked = 12,
                    WrongSize = 3,
                };

            // And get the security context
            var principalFeature = req.FunctionContext.Features.Get<JwtPrincipalFeature>();

            // Build and send the response
            return await FunctionHelper.PrepareResponseAsync(req, responseContent, principalFeature);
        }
    }
}
