using System.Net;
using Contoso.Retail.Demo.Backend.FunctiosMiddleware;
using Contoso.Retail.Demo.Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;

namespace Contoso.Retail.Demo.Backend
{
    public class ImageAsset
    {
        private readonly ILogger _logger;

        public ImageAsset(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<ImageAsset>();
        }

        [Function("ImageAsset")]
        [OpenApiOperation(operationId: "ImageAsset", tags: new[] { "Binary Content" })]
        [OpenApiParameter("imageFile", Description = "The filename of the image to return", Required = true, Type = typeof(string))]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "image/png", bodyType: typeof(Stream), Description = "The requested image, if any")]
        [AllowAnonymous]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "images/{imageFile}")] HttpRequestData req, string imageFile)
        {
            _logger.LogInformation($"Requested image file {imageFile}.");

            var functionDefinition = req.FunctionContext.Features.Get<FunctionDefinition>();
            var functionAssemblyPath = functionDefinition?.PathToAssembly.Substring(0, functionDefinition.PathToAssembly.LastIndexOf(@"\"));
            var imageFilePath = $@"{functionAssemblyPath}\assets\{imageFile}";
            if (File.Exists(imageFilePath) == false)
            {
                _logger.LogInformation($"Image file {imageFile} not found.");
                return req.CreateResponse(HttpStatusCode.NotFound);
            }
            else
            {
                using (FileStream fs = new FileStream($"assets/{imageFile}", FileMode.Open, FileAccess.Read))
                {
                    var response = req.CreateResponse(HttpStatusCode.OK);
                    await fs.CopyToAsync(response.Body);
                    response.Headers.Add("Content-Type", "image/png");
                    response.Headers.Add("Content-Disposition", $"attachment; filename=\"{imageFile}\"");
                    return response;
                }
            }
        }

    }
}
