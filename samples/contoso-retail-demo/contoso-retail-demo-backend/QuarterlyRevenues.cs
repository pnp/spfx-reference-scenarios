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
    public class QuarterlyRevenues
    {
        private readonly ILogger _logger;

        public QuarterlyRevenues(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<QuarterlyRevenues>();
        }

        [Function("QuarterlyRevenues")]
        [OpenApiOperation(operationId: "QuarterlyRevenues", tags: new[] { "Retail" })]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(QuarterlyRevenuesData), Description = "The quarterly revenue stats")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, Roles = new string[] { "ContosoRetail.Consume.All" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _logger.LogInformation("QuarterlyRevenues function triggered.");

            // Build the response content
            var responseContent = new QuarterlyRevenuesData
            {
                Revenues = new List<QuarterlyRevenue>(new QuarterlyRevenue[] {
                        new QuarterlyRevenue {
                            Quarter = 1,
                            Revenues = 1176342
                        },
                        new QuarterlyRevenue {
                            Quarter = 2,
                            Revenues = 15290086
                        },
                        new QuarterlyRevenue {
                            Quarter = 3,
                            Revenues = 50343098
                        },
                        new QuarterlyRevenue {
                            Quarter = 4,
                            Revenues = 76098003
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
