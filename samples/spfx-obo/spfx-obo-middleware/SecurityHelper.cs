using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;

internal static class SecurityHelper {
    public static async Task<string> GetOboToken(string bearerToken){

        // Initialize configuration variables
        var clientId = Environment.GetEnvironmentVariable("ClientId");
        var tenantId = Environment.GetEnvironmentVariable("TenantId");
        var clientSecret = Environment.GetEnvironmentVariable("ClientSecret");
        var scopesString = Environment.GetEnvironmentVariable("Scopes");
        var scopes = scopesString?.Split(',');

        // Create the MSAL confidential client application for On-Behalf-Of flow
        var confidentialClientApplication = ConfidentialClientApplicationBuilder
            .Create(clientId)
            .WithTenantId(tenantId)
            .WithClientSecret(clientSecret)
            .Build();

        // Prepare the user assertion based on the received Access Token
        var assertion = new UserAssertion(bearerToken);

        // Try to get the token from the tokens cache
        var tokenResult = await confidentialClientApplication
            .AcquireTokenOnBehalfOf(scopes, assertion)
            .ExecuteAsync().ConfigureAwait(false);

        // Provide back the OBO Access Token
        return tokenResult.AccessToken;        
    }
}