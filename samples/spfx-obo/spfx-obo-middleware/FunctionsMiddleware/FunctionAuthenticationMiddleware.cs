using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.Extensions.Configuration;

namespace PnP.SPFxOBO.Middleware.FunctionsMiddleware
{
    public class FunctionAuthenticationMiddleware : IFunctionsWorkerMiddleware
    {
        private readonly JwtSecurityTokenHandler _tokenValidator;
        private readonly TokenValidationParameters _tokenValidationParameters;
        private readonly ConfigurationManager<OpenIdConnectConfiguration> _configurationManager;

        public FunctionAuthenticationMiddleware(IConfiguration configuration)
        {
            var tenantId = configuration["TenantId"];
            var audience = configuration["Audience"];
            var authority = configuration["Authority"];

            _tokenValidator = new JwtSecurityTokenHandler();
            _tokenValidationParameters = new TokenValidationParameters
            {
                ValidAudience = audience
            };
            
            _configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                $"{authority}/.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever());
        }
        public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
        {
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
            validationParameters.ValidIssuer = openIdConfig.Issuer;
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
            token = null;
            
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