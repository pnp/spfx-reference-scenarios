using System.Net;
using Contoso.Retail.Demo.Backend.FunctiosMiddleware;
using Contoso.Retail.Demo.Backend.Model;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace Contoso.Retail.Demo.Backend
{
    public class CustomerSatisfactionStats
    {
        private readonly ILogger _logger;

        public CustomerSatisfactionStats(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<CustomerSatisfactionStats>();
        }

        [Function("CustomerSatisfactionStats")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
        {
            _logger.LogInformation("CustomerSatisfactionStats function triggered.");

            // Build the response content
            var responseContent = new CustomerSatisfaction
                {
                    CStat = 95,
                    NStat = 90,
                    Tts = 80
                };

            // And get the security context
            var principalFeature = req.FunctionContext.Features.Get<JwtPrincipalFeature>();

            // Build and send the response
            return await FunctionHelper.PrepareResponseAsync(req, responseContent, principalFeature);
        }
    }
}
