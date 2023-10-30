using System.Net;
using Contoso.Retail.Demo.Backend.FunctiosMiddleware;
using Contoso.Retail.Demo.Backend.Model;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;

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
        [OpenApiOperation(operationId: "Inventory", tags: new[] { "Retail" })]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(InventoryData), Description = "The inventory data")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, Roles = new string[] { "ContosoRetail.Consume.All" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
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
