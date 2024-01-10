using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace ace_expense_report_backend
{
    public class UploadExpenseReport
    {
        private readonly ILogger _logger;

        public UploadExpenseReport(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<UploadExpenseReport>();
        }

        [Function("UploadExpenseReport")]
        public HttpResponseData Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "text/plain; charset=utf-8");

            response.WriteString("Welcome to Azure Functions!");

            return response;
        }
    }
}
