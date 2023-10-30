using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using PnP.SPFxOBO.Middleware.FunctionsMiddleware;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults((context, builder) =>
    {
        // Credits to Joonas Westlin: https://github.com/juunas11/IsolatedFunctionsAuthentication
        // I created my implementation starting from there, with some little touches
        builder.UseMiddleware<FunctionAuthenticationMiddleware>();
        builder.UseMiddleware<FunctionAuthorizationMiddleware>();
    })
    .Build();

host.Run();
