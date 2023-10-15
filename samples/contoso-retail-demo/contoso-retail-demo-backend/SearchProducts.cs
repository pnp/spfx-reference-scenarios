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
    public class SearchProducts
    {
        private readonly ILogger _logger;

        public SearchProducts(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<ProductsInventory>();
        }

        [Function("SearchProducts")]
        [OpenApiOperation(operationId: "SearchProducts", tags: new[] { "Retail" })]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(Products), Description = "Search the list of products")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, Roles = new string[] { "ContosoRetail.Consume.All" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _logger.LogInformation("SearchProducts function triggered.");

            var imageBaseUrl = $"{req.Url.Scheme}://{req.Url.Authority}/api/images/";
            var query = req.Query["q"];

            // Build the response content
            var responseContent = new Products
            {
                Items = new List<Product>(new Product[] {
                        new Product {
                            Code = "P01",
                            Description = "Contoso Denim Jacket",
                            Price = 54,
                            Picture = $"{imageBaseUrl}jeans-jacket.png",
                            LaunchDate = DateTime.Now.AddDays(-40),
                            Sales = 20987
                        },
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
                        new Product {
                            Code = "P04",
                            Description = "Contoso Black Jacket",
                            Price = 41,
                            Picture = $"{imageBaseUrl}black-jacket.png",
                            LaunchDate = DateTime.Now.AddDays(-45),
                            Sales = 12743
                        },
                        new Product {
                            Code = "P05",
                            Description = "Contoso Skirt",
                            Price = 38,
                            Picture = $"{imageBaseUrl}skirt.png",
                            LaunchDate = DateTime.Now.AddDays(-3),
                            Sales = 5843
                        },
                        new Product {
                            Code = "P06",
                            Description = "Cotton Blue Shirt",
                            Price = 52,
                            Picture = $"{imageBaseUrl}blue-shirt.png",
                            LaunchDate = DateTime.Now.AddDays(-20),
                            Sales = 3841
                        },
                    })
            };

            if (!string.IsNullOrEmpty(query))
            {
                responseContent.Items = responseContent.Items
                    .Where(p => p.Description.Contains(query, StringComparison.InvariantCultureIgnoreCase))
                    .ToList();
            }

            // And get the security context
            var principalFeature = req.FunctionContext.Features.Get<JwtPrincipalFeature>();

            // Build and send the response
            return await FunctionHelper.PrepareResponseAsync(req, responseContent, principalFeature);
        }
    }
}
