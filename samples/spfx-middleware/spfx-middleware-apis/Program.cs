using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.Resource;
using spfx_middleware_apis;
using System.Net.Http;
using System.Net.Http.Headers;

const string allowAllCorsPolicy = "AllowAllCors";

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: allowAllCorsPolicy,
        policy =>
        {
            policy.AllowAnyOrigin();
            policy.AllowAnyMethod();
            policy.AllowAnyHeader();
        });
});

// Add services to the container.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));
builder.Services.AddAuthorization();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add the HttpClient service
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(allowAllCorsPolicy);
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

var scopeRequiredByApi = app.Configuration["AzureAd:Scopes"] ?? "";

app.MapPost("/consumeWithOBO", async (RequestFromConsumer messageRequest, HttpContext httpContext, IHttpClientFactory httpClientFactory) =>
{
    httpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

    // Get the Access Token
    var accessToken = string.Empty;
    var authorizationHeader = httpContext.Request.Headers["Authorization"].FirstOrDefault();
    if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.ToUpper().StartsWith("BEARER"))
    {
        accessToken = authorizationHeader.Split(" ")[1];

        // Request an OBO token to consume SharePoint Online
        var oboTokenForSPO = await SecurityHelper.GetOboToken(
            tenantId: app.Configuration["AzureAd:TenantId"],
            clientId: app.Configuration["AzureAd:ClientId"],
            clientSecret: app.Configuration["AzureAd:ClientSecret"],
            scopesString: app.Configuration["OboScopes:SharePointOnline"].Replace("{tenantName}", messageRequest.TenantName),
            accessToken);

        // Request an OBO token to consume Microsoft Graph
        var oboTokenForGraph = await SecurityHelper.GetOboToken(
            tenantId: app.Configuration["AzureAd:TenantId"],
            clientId: app.Configuration["AzureAd:ClientId"],
            clientSecret: app.Configuration["AzureAd:ClientSecret"],
            scopesString: app.Configuration["OboScopes:MicrosoftGraph"],
            accessToken);

        // Prepare an HttpClient to consume SharePoint Online and Microsoft Graph
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        // Consume SharePoint Online
        var spoRequest = new HttpRequestMessage(HttpMethod.Get, $"https://{messageRequest.TenantName}/{messageRequest.SiteRelativeUrl}/_api/web");
        spoRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", oboTokenForSPO);
        var spoResponse = await client.SendAsync(spoRequest);

        // Process the JSON response
        var web = await spoResponse.Content.ReadFromJsonAsync<SpoWeb>();

        // Consume Microsoft Graph
        var graphMeRequest = new HttpRequestMessage(HttpMethod.Get, "https://graph.microsoft.com/v1.0/me");
        graphMeRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", oboTokenForGraph);
        var graphMeResponse = await client.SendAsync(graphMeRequest);

        // Process the JSON response
        var me = await graphMeResponse.Content.ReadFromJsonAsync<GraphUser>();

        return new
        {
            UserPrincipalName = me.UserPrincipalName,
            WebSiteTitle = web.Title
        };
    }

    return null;
})
.WithName("consumeWithOBO")
.RequireAuthorization();

app.MapPost("/consumeWithoutOBO", (RequestFromConsumer messageRequest, HttpContext httpContext) =>
{
    httpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);

    return new
    {
        UserPrincipalName = "someone@withoutobo.onmicrosoft.com",
        WebSiteTitle = "Web Site Title"
    };
})
.WithName("consumeWithoutOBO")
.RequireAuthorization();

app.Run();
