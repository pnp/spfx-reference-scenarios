using System.Text.Json;
using System.Text.Json.Serialization;
using Contoso.Retail.Demo.Backend.FunctiosMiddleware;
using Microsoft.Azure.Functions.Worker.Extensions.OpenApi.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

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
    })
    .ConfigureFunctionsWorkerDefaults((context, builder) =>
    {
        // Credits to Joonas Westlin: https://github.com/juunas11/IsolatedFunctionsAuthentication
        // I created my implementation starting from there, with some little touches
        builder.UseMiddleware<FunctionAuthenticationMiddleware>();
        builder.UseMiddleware<FunctionAuthorizationMiddleware>();
    })
    .ConfigureOpenApi()
    .Build();

host.Run();
