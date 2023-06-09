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
    public class ProductsOnLaunch
    {
        private readonly ILogger _logger;

        public ProductsOnLaunch(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<ProductsOnLaunch>();
        }

        [Function("ProductsOnLaunch")]
        [OpenApiOperation(operationId: "ProductsOnLaunch", tags: new[] { "Retail" })]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(Products), Description = "The list of products on launch")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, Roles = new string[] { "ContosoRetail.Consume.All" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _logger.LogInformation("ProductsOnLaunch function triggered.");

            var imageBaseUrl = $"{req.Url.Scheme}://{req.Url.Authority}/api/images/";

            // Build the response content
            var responseContent = new Products
            {
                Items = new List<Product>(new Product[] {
                        new Product {
                            Code = "P02",
                            Description = "Contoso Denim Jeans",
                            Price = 72,
                            Picture = $"{imageBaseUrl}blue-jeans.png",
                            LaunchDate = DateTime.Now.AddDays(+2),
                            Sales = 11238
                        },
                        new Product {
                            Code = "P03",
                            Description = "Cotton t-shirt",
                            Price = 35,
                            Picture = $"{imageBaseUrl}peach-hoodie.png",
                            LaunchDate = DateTime.Now.AddDays(+12),
                            Sales = 9567
                        },
                    })
            };

            // And get the security context
            var principalFeature = req.FunctionContext.Features.Get<JwtPrincipalFeature>();

            // Build and send the response
            return await FunctionHelper.PrepareResponseAsync(req, responseContent, principalFeature);
        }
    }
}
