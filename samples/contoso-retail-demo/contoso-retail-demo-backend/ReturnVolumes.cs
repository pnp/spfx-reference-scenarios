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
    public class ReturnVolumes
    {
        private readonly ILogger _logger;

        public ReturnVolumes(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<ReturnVolumes>();
        }

        [Function("ReturnVolumes")]
        [OpenApiOperation(operationId: "ReturnVolumes", tags: new[] { "Retail" })]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ReturnVolumesData), Description = "The returns volumes stats")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        [FunctionAuthorize(Scopes = new string[] { "ContosoRetail.Consume" }, Roles = new string[] { "ContosoRetail.Consume.All" }, RunOnBehalfOf = false)]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _logger.LogInformation("ReturnVolumes function triggered.");

            // Build the response content
            var responseContent = new ReturnVolumesData
            {
                MaximumReturns = 6600,
                MaximumInventory = 5500,
                CurrentReturns = 2930,
                CurrentInventory = 5293,
                MonthlyReturns = new List<MonthlyReturn>(
                        new MonthlyReturn[] {
                            new MonthlyReturn {
                                Month = 1,
                                Returns =  1930,
                                Inventory =  2024
                            },
                            new MonthlyReturn {
                                Month = 2,
                                Returns =  6600,
                                Inventory =  3140
                            },
                            new MonthlyReturn {
                                Month = 3,
                                Returns =  4123,
                                Inventory =  3750
                            },
                            new MonthlyReturn {
                                Month = 4,
                                Returns =  2853,
                                Inventory =  5500
                            },
                            new MonthlyReturn {
                                Month = 5,
                                Returns =  2930,
                                Inventory =  5293
                            },
                            new MonthlyReturn {
                                Month = 6,
                                Returns =  3454,
                                Inventory =  2692
                            },
                            new MonthlyReturn {
                                Month = 7,
                                Returns =  3129,
                                Inventory =  4514
                            },
                            new MonthlyReturn {
                                Month = 8,
                                Returns =  3134,
                                Inventory =  4741
                            },
                            new MonthlyReturn {
                                Month = 9,
                                Returns =  3247,
                                Inventory =  2643
                            },
                            new MonthlyReturn {
                                Month = 10,
                                Returns =  1485,
                                Inventory =  1872
                            },
                            new MonthlyReturn {
                                Month = 11,
                                Returns =  3134,
                                Inventory =  4512
                            },
                            new MonthlyReturn {
                                Month = 12,
                                Returns =  2824,
                                Inventory =  3923
                            }
                        }
                    )
            };

            // And get the security context
            var principalFeature = req.FunctionContext.Features.Get<JwtPrincipalFeature>();

            // Build and send the response
            return await FunctionHelper.PrepareResponseAsync(req, responseContent, principalFeature);
        }
    }
}
