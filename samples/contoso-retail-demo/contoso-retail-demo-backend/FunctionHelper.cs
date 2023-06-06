using System.Net;
using Contoso.Retail.Demo.Backend.FunctiosMiddleware;
using Contoso.Retail.Demo.Backend.Model;
using Microsoft.Azure.Functions.Worker.Http;

namespace Contoso.Retail.Demo.Backend
{
    public static class FunctionHelper
    {
        public static async Task<HttpResponseData> PrepareResponseAsync(HttpRequestData request, Object responseContent, JwtPrincipalFeature principalFeature)
        {
            // If we've got the security context
            if (principalFeature != null)
            {
                ((BaseResponse)responseContent).CurrentUserUPN = principalFeature.Principal.Identity.Name;
            }

            // Build and send the response
            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(responseContent);

            return response;
        }
    }
}