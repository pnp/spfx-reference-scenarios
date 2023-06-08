using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;

namespace Contoso.Retail.Demo.Backend.FunctiosMiddleware
{
    public class FunctionAuthenticationMiddleware : IFunctionsWorkerMiddleware
    {
        private readonly JwtSecurityTokenHandler _tokenValidator;
        private readonly TokenValidationParameters _tokenValidationParameters;
        private readonly ConfigurationManager<OpenIdConnectConfiguration> _configurationManager;

        private static Regex _tenantIdRegEx = new Regex(@"(?<STSTrailer>(https:\/\/sts\.windows\.net\/))(?<TenantId>((\w|\-)*))\/");

        public FunctionAuthenticationMiddleware(IConfiguration configuration)
        {
            var tenantId = configuration["TenantId"];
            var audience = configuration["Audience"];
            var authority = configuration["Authority"];

            _tokenValidator = new JwtSecurityTokenHandler();
            _tokenValidationParameters = new TokenValidationParameters
            {
                ValidAudience = audience,
                IssuerValidator = (string issuer, SecurityToken securityToken, TokenValidationParameters validationParameters) => {

                    // An option is to use Dynamic Issuer validation, searching
                    // the issuer via an external repository and validating it accordingly

                    // Check if we have proper value for issuer claim
                    if (_tenantIdRegEx.IsMatch(issuer)) 
                    {
                        // Try to extract the TenantId
                        var tenantId = _tenantIdRegEx.Matches(issuer).FirstOrDefault()?.Groups["TenantId"].Value;

                        // If we have the TenantId
                        if (!string.IsNullOrEmpty(tenantId))
                        {
                            // Convert the ID into a GUID
                            var tenantIdValue = new Guid(tenantId);

                            // This is a demo API so we do nothing
                            // However, in a real solution you should search the tenant in a backend repository

                            // Always consider the tenant as a valid one
                            return issuer;
                        }
                    }

                    // Otherwise, the issuer is not valid!
                    throw new SecurityTokenInvalidIssuerException(
                        $"IDW10303: Issuer: '{issuer}', does not match any of the valid issuers provided for this application.");
                }
            };
            
            _configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                $"{authority}/.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever());
        }
        public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
        {
            // Get the invoked function method
            var targetMethod = context.GetTargetFunctionMethod();

            // Get the FunctionAuthorize attribute, if any
            var allowAnonymousAttribute = targetMethod.GetCustomAttribute<AllowAnonymousAttribute>();

            if (allowAnonymousAttribute != null || 
                targetMethod.DeclaringType?.FullName == "Microsoft.Azure.Functions.Worker.Extensions.OpenApi.DefaultOpenApiHttpTrigger") {
                // Skip the authentication code because we allow anonymous
                await next(context);
                return;
            }

            // Try to get the access token from the request headers, if any
            if (!TryGetTokenFromHeaders(context, out var token))
            {
                // Unable to get token from headers
                context.SetHttpResponseStatusCode(HttpStatusCode.Unauthorized);
                return;
            }

            if (!_tokenValidator.CanReadToken(token))
            {
                // Token is malformed
                context.SetHttpResponseStatusCode(HttpStatusCode.Unauthorized);
                return;
            }

            // Get OpenID Connect metadata
            var validationParameters = _tokenValidationParameters.Clone();
            var openIdConfig = await _configurationManager.GetConfigurationAsync(default);

            // validationParameters.ValidateIssuer = false;
            // validationParameters.ValidIssuers = new string[] {
            //     "https://sts.windows.net/26a540dd-4476-4541-b1ec-cfdd29e25b14/",
            //     "https://sts.windows.net/6c94075a-da0a-4c6a-8411-badf652e8b53/"
            //     };
            // validationParameters.ValidIssuer = openIdConfig.Issuer;

            validationParameters.IssuerSigningKeys = openIdConfig.SigningKeys;

            try
            {
                // Validate token
                var principal = _tokenValidator.ValidateToken(
                        token, validationParameters, out _);

                // Set principal + token in Features collection
                // They can be accessed from here later in the call chain
                context.Features.Set(new JwtPrincipalFeature(principal, token));

                await next(context);
            }
            catch (SecurityTokenException)
            {
                // Token is not valid (expired etc.)
                context.SetHttpResponseStatusCode(HttpStatusCode.Unauthorized);
                return;
            }
        }

        private static bool TryGetTokenFromHeaders(FunctionContext context, out string token)
        {
            token = string.Empty;
            
            // HTTP headers are in the binding context as a JSON object
            // The first checks ensure that we have the JSON string
            if (!context.BindingContext.BindingData.TryGetValue("Headers", out var headersObj))
            {
                return false;
            }

            if (headersObj is not string headersStr)
            {
                return false;
            }

            // Deserialize headers from JSON
            var headers = JsonSerializer.Deserialize<Dictionary<string, string>>(headersStr);
            if (headers != null) {

                var normalizedKeyHeaders = headers.ToDictionary(h => h.Key.ToLowerInvariant(), h => h.Value);
                if (!normalizedKeyHeaders.TryGetValue("authorization", out var authHeaderValue))
                {
                    // No Authorization header present
                    return false;
                }

                if (!authHeaderValue.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    // Scheme is not Bearer
                    return false;
                }

                token = authHeaderValue.Substring("Bearer ".Length).Trim();
                return true;
            }

            return false;
        }
    }
}