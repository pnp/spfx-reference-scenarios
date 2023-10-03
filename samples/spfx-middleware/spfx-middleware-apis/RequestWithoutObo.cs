namespace spfx_middleware_apis
{
    public class RequestWithoutObo
    {
        public string TenantName { get; set; }
        public string SiteRelativeUrl { get; set; }
        public string SpoAccessToken { get; set; }
        public string GraphAccessToken { get; set; }
    }
}
