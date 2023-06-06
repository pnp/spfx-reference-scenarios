using System.Net;
using Contoso.Retail.Demo.Backend.FunctiosMiddleware;
using Contoso.Retail.Demo.Backend.Model;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace Contoso.Retail.Demo.Backend
{
    public class Inventory
    {
        private readonly ILogger _logger;

        public Inventory(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<Inventory>();
        }

        [Function("Inventory")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
        {
            _logger.LogInformation("Inventory function triggered.");

            // Build the response content
            var responseContent = new InventoryData
                {
                    InventoryDate = DateTime.UtcNow,
                    WomenItems = 35122,
                    MenItems = 45342,
                    AccessoriesItems = 40958,
                    HandbagsItems = 29450,
                    SalesItems = 39183
                };

            // And get the security context
            var principalFeature = req.FunctionContext.Features.Get<JwtPrincipalFeature>();

            // Build and send the response
            return await FunctionHelper.PrepareResponseAsync(req, responseContent, principalFeature);
        }
    }
}
