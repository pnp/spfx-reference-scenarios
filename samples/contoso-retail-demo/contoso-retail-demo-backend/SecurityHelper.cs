using System.Security.Cryptography;
using System.Text;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;

namespace Contoso.Retail.Demo.Backend
{
    internal static class SecurityHelper {

        public static async Task<string> GetOboToken(string bearerToken, string tenantId){

            // Initialize configuration variables
            var clientId = Environment.GetEnvironmentVariable("ClientId");
            if (string.IsNullOrEmpty(tenantId)) {
                var tenantIdDefaultValue = Environment.GetEnvironmentVariable("TenantId");
                if (tenantIdDefaultValue != null)
                {
                    tenantId = tenantIdDefaultValue;
                }
                else
                {
                    throw new Exception("TenantId is not provided");
                }
            } 
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

        public static string ComputeHash(string input)
        {
            // Compute a SHA256 hash on the input   
            using (SHA256 sha256Hash = SHA256.Create())  
            {  
                // ComputeHash - returns byte array  
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(input));  

                // Convert byte array to a string   
                StringBuilder builder = new StringBuilder();  
                for (int i = 0; i < bytes.Length; i++)  
                {  
                    builder.Append(bytes[i].ToString("x2"));  
                }  
                return builder.ToString();  
            } 
        }
    }
}