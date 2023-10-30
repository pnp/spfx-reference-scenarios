using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Reflection;

namespace PnP.SPFxOBO.Middleware.FunctionsMiddleware
{
    public class FunctionAuthorizationMiddleware : IFunctionsWorkerMiddleware
    {
        private const string ScopeClaimType = "http://schemas.microsoft.com/identity/claims/scope";

        public async Task Invoke(
            FunctionContext context,
            FunctionExecutionDelegate next)
        {
            // Get the consumer's princiapl from the function context
            var principalFeature = context.Features.Get<JwtPrincipalFeature>();

            // Get the invoked function method
            var targetMethod = context.GetTargetFunctionMethod();

            // Get the FunctionAuthorize attribute, if any
            var functionAuthorizeAttribute = targetMethod.GetCustomAttribute<FunctionAuthorizeAttribute>();

            // In case there is the FunctionAuthorize attribute
            // let's check authorization based on the accepted scopes
            if (functionAuthorizeAttribute != null && !AuthorizePrincipal(context, 
                principalFeature.Principal, functionAuthorizeAttribute.Scopes))
            {
                context.SetHttpResponseStatusCode(HttpStatusCode.Forbidden);
                return;
            }

            // If the FunctionAuthorize attribute requires me to run on-behalf-of the user
            if (functionAuthorizeAttribute != null && functionAuthorizeAttribute.RunOnBehalfOf)
            {
                // let's get the OBO token
                var oboToken = await SecurityHelper.GetOboToken(principalFeature.AccessToken);
                // and update the principal feature
                var updatedPrincipalFeature = new JwtPrincipalFeature(principalFeature.Principal, principalFeature.AccessToken, oboToken); 
                context.Features.Set<JwtPrincipalFeature>(updatedPrincipalFeature);
            }

            await next(context);
        }

        private static bool AuthorizePrincipal(FunctionContext context, ClaimsPrincipal principal, string[] acceptedScopes)
        {
            // This authorization implementation was made
            // for Azure AD. Your identity provider might differ.

            if (principal.HasClaim(c => c.Type == ScopeClaimType))
            {
                // Request made with delegated permissions, check scopes and user roles
                return AuthorizeDelegatedPermissions(context, principal, acceptedScopes);
            }
            else
            {
                // If we don't have the scope claim, we cannot authorize the request
                return false;
            }
        }

        private static bool AuthorizeDelegatedPermissions(FunctionContext context, ClaimsPrincipal principal, string[] acceptedScopes)
        {
            // Scopes are stored in a single claim, space-separated
            var callerScopes = (principal.FindFirst(ScopeClaimType)?.Value ?? "")
                .Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var callerHasAcceptedScope = callerScopes.Any(cs => acceptedScopes.Contains(cs));

            return callerHasAcceptedScope;
        }
    }
}