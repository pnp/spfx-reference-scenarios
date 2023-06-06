using System.Net;
using Contoso.Retail.Demo.Backend.FunctiosMiddleware;
using Contoso.Retail.Demo.Backend.Model;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace Contoso.Retail.Demo.Backend
{
    public class TopSellerProduct
    {
        private readonly ILogger _logger;

        public TopSellerProduct(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<TopSellerProduct>();
        }

        [Function("TopSellerProduct")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
        {
            _logger.LogInformation("TopSellerProduct function triggered.");

            var imageBaseUrl = $"{req.Url.Scheme}://{req.Url.Authority}/api/images/";

            // Build the response content
            var responseContent = new Product {
                Code = "P01",
                Description = "Contoso Denim Jacket",
                Price = 54,
                Picture = $"{imageBaseUrl}jeans-jacket.png",
                LaunchDate = DateTime.Now.AddDays(-40),
                Sales = 20987
            };

            // And get the security context
            var principalFeature = req.FunctionContext.Features.Get<JwtPrincipalFeature>();

            // Build and send the response
            return await FunctionHelper.PrepareResponseAsync(req, responseContent, principalFeature);
        }

    }
}
