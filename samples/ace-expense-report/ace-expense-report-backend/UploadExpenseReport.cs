using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;

namespace PnP.Ace.ExpenseReport.Backend
{
    public class UploadExpenseReport
    {
        private readonly ILogger _logger;

        public UploadExpenseReport(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<UploadExpenseReport>();
        }

        [Function("UploadExpenseReport")]
        [OpenApiOperation(operationId: "UploadExpenseReport", tags: new[] { "Expense Reports" })]
        [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(ExpenseReport), Required = true, Description = "The Expense Report object")]
        [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
        [FunctionAuthorize(Scopes = new string[] { "ExpenseReport.Create" }, RunOnBehalfOf = true)]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", "options")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                var model = JsonConvert.DeserializeObject<ExpenseReport>(requestBody);

                // Convert the file content into a MemoryStream
                var fileContent = model.ReceiptContent.Substring(model.ReceiptContent.IndexOf(";base64,") + 8);
                byte[] byteArray = Convert.FromBase64String(fileContent);
                using (MemoryStream memoryStream = new MemoryStream(byteArray))
                {
                    // Now use Microsoft Graph SDK to store the file in SPO

                    // Get the OBO token for Microsoft Graph
                    var principal = req.FunctionContext.Features.Get<JwtPrincipalFeature>();
                    var graphAccessToken = principal?.OnBehalfOfToken;

                    if (graphAccessToken != null)
                    {
                        var client = new SimpleGraphClient(graphAccessToken);
                        await client.SaveExpenseReportFile(model, memoryStream);
                    }
                }

                _logger.LogInformation(requestBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error!");
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "text/plain; charset=utf-8");

            response.WriteString("Welcome to Azure Functions!");

            return response;
        }
    }
}
