using System.Security.Claims;

namespace PnP.Ace.ExpenseReport.Backend
{
    /// <summary>
    /// Holds the authenticated user principal
    /// for the request along with the
    /// access token they used.
    /// </summary>
    public class JwtPrincipalFeature
    {
        public JwtPrincipalFeature(ClaimsPrincipal principal, string accessToken)
        {
            // Set principal and Access Token
            Principal = principal;
            AccessToken = accessToken;

            // Retrieve current Tenant ID
            var tenantId = principal.FindFirst(c => c.Type == ClaimTypes.TenantIdClaimType);
            TenantId = tenantId?.Value;
        }

        public JwtPrincipalFeature(ClaimsPrincipal principal, string accessToken, string oboToken):
            this(principal, accessToken)
        {
            // Set On-Behalf-Of Token
            OnBehalfOfToken = oboToken;
        }

        public ClaimsPrincipal Principal { get; }

        /// <summary>
        /// The access token that was used for this
        /// request. Can be used to acquire further
        /// access tokens with the on-behalf-of flow.
        /// </summary>
        public string AccessToken { get; }

        /// <summary>
        /// The access token to run on-behalf-of 
        /// the current user
        /// </summary>
        public string? OnBehalfOfToken { get; }

        /// <summary>
        /// The ID of the current tenant in a multi-tenant solution
        /// </summary>
        public string? TenantId { get; }
    }
}