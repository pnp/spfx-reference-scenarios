using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Net;
using Microsoft.Identity.Web;

namespace Contoso.Orders.FunctionApp
{
    /// <summary>
    /// Custom attribute to provide custom authorization logic for Funtion App functions
    /// </summary>
    [Obsolete("This class is dependent on Azure Functions preview features.")]
    internal class FunctionAuthorizeAttribute : FunctionInvocationFilterAttribute
    {
        private string scopes;

        /// <summary>
        /// The Authorization Policy to use for authorization purposes
        /// </summary>
        public string Scopes
        {
            get
            {
                return this.scopes;
            }
            set
            {
                this.scopes = value;
                this.scopesArray = this.scopes.Split(",", StringSplitOptions.RemoveEmptyEntries);
            }
        }

        private string[] scopesArray;

        /// <summary>
        /// Default constructor, without any specific authorization policy
        /// </summary>
        public FunctionAuthorizeAttribute()
        {
            this.scopesArray = new string[0];
        }

        /// <summary>
        /// Costructor with custom authorization policy requirement
        /// </summary>
        /// <param name="scopes">The permission scopes required</param>
        public FunctionAuthorizeAttribute(string scopes)
        {
            this.Scopes = scopes;
        }

        public override async Task OnExecutingAsync(FunctionExecutingContext executingContext, CancellationToken cancellationToken)
        {
            // Variable to hold the result
            var authorizationResult = false;

            // Get the HttpContext of the request either via HttpRequest or HttpRequestMessage
            HttpContext httpContext = null;
            var contextIntermediary = executingContext.Arguments.Values
                .FirstOrDefault(i => i is HttpRequest || i is HttpRequestMessage);

            if (contextIntermediary is HttpRequest request)
            {
                httpContext = request.HttpContext;
            }
            else if (contextIntermediary is HttpRequestMessage message)
            {
                httpContext = message.Properties[nameof(HttpContext)] as HttpContext;
            }

            if (httpContext != null)
            {
                // Authenticate the received token
                var (succeeded, authenticationResult) = await httpContext.AuthenticateAzureFunctionAsync();

                if (succeeded)
                {
                    // In case of successfull authentication, impersonate the current ClaimsPrincipal
                    var claimsPrincipal = httpContext.User;

                    // And validate the scopes if the current user is authenticated
                    if (this.scopesArray != null &&
                        this.scopesArray.Length > 0 &&
                        claimsPrincipal != null &&
                        claimsPrincipal.Identity != null &&
                        claimsPrincipal.Identity.IsAuthenticated)
                    {
                        // If we have a claim scope with one of the expected scopes
                        if (claimsPrincipal.Claims.FirstOrDefault(
                            c =>
                            {
                                if (c.Type == "http://schemas.microsoft.com/identity/claims/scope")
                                {
                                    var claimScopes = c.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                                    return this.scopesArray.Intersect(claimScopes).Count() > 0;
                                }
                                else
                                {
                                    return false;
                                }
                            }) != null)
                        {
                            authorizationResult = true;
                        }
                    }
                }
            }

            if (!authorizationResult)
            {
                var forbiddenText = HttpStatusCode.Forbidden.ToString();

                // notify the security issue to the consumer
                await RewriteResponse((int)HttpStatusCode.Forbidden, forbiddenText, httpContext.Response);

                // raise a 403 Security Exception
                throw new Exception($"{(int)HttpStatusCode.Forbidden} - {forbiddenText}");
            }

            await base.OnExecutingAsync(executingContext, cancellationToken);
        }

        private async Task RewriteResponse(int statusCode, string message, HttpResponse response)
        {
            if (!response.HasStarted)
            {
                response.StatusCode = statusCode;
                response.ContentType = "text/plain";
                response.ContentLength = message.Length;
                await response.WriteAsync(message);
                await response.Body.FlushAsync();
            }
        }
    }
}
