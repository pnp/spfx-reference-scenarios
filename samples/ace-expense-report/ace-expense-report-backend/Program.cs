using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json.Serialization;
using System.Text.Json;
using PnP.Ace.ExpenseReport.Backend;

var host = new HostBuilder()
    .ConfigureServices((context, services) =>
    {
        // Define global JSON serializer options
        services.Configure<JsonSerializerOptions>(options =>
        {
            options.AllowTrailingCommas = true;
            options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.PropertyNameCaseInsensitive = true;
        });

        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
    })
    .ConfigureFunctionsWorkerDefaults((context, builder) =>
    {
        // Credits to Joonas Westlin: https://github.com/juunas11/IsolatedFunctionsAuthentication
        // I created my implementation starting from there, with some little touches (Application only, OBO flow, etc.)
        builder.UseWhen<FunctionAuthenticationMiddleware>(functionContext =>
        {
            // Only use the middleware if not related to Swagger or OpenApi
            return !functionContext.FunctionDefinition.Name.Contains("swagger", StringComparison.InvariantCultureIgnoreCase) &&
                !functionContext.FunctionDefinition.Name.Contains("openapi", StringComparison.InvariantCultureIgnoreCase);
        });
        builder.UseMiddleware<FunctionAuthorizationMiddleware>();
    })
    .Build();

host.Run();
