using System.Security.Claims;

namespace PnP.SPFxOBO.Middleware.FunctionsMiddleware
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
            Principal = principal;
            AccessToken = accessToken;
        }

        public JwtPrincipalFeature(ClaimsPrincipal principal, string accessToken, string oboToken)
        {
            Principal = principal;
            AccessToken = accessToken;
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
        public string OnBehalfOfToken { get; }
    }
}