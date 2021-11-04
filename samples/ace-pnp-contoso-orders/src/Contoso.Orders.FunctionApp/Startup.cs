using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using Contoso.Orders.FunctionApp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Contoso.Orders.FunctionApp
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            var configuration = builder.GetContext().Configuration;

            builder.Services.AddLogging();

            builder.Services.AddAuthenticationCore(c =>
            {
                c.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                c.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddMicrosoftIdentityWebApiAuthentication(configuration);

            builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme,
                options =>
                {
                    options.TokenValidationParameters.IssuerValidator = (issuer, token, parameters) =>
                    {
                        // Here we can validate the issuer reading for example a list
                        // of issuers (i.e. subscribed tenants) from a data repository

                        // Then, to confirm that the issuer is valid, we simply return
                        // the issuer itself

                        // For the sake of simplicity, in this sample API we accept any issuer
                        return issuer;

                        // But in case of an invalid issuer, you could throw the following exception
                        //throw new SecurityTokenInvalidIssuerException(
                        //    $"IDW10303: Issuer: '{issuer}', does not match any of the valid issuers provided for this application.");
                    };
                });

        }
    }
}