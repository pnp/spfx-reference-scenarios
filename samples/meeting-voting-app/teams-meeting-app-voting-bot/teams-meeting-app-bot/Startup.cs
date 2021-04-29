using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TeamsMeetingAppBot.Bots;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using TeamsMeetingAppBot.Repository.Sql;
using TeamsMeetingAppBot.Repository;
using Microsoft.EntityFrameworkCore;
using TeamsMeetingAppBot.Utility;
using Microsoft.Graph;
using Microsoft.Identity.Client;

namespace TeamsMeetingAppBot
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            // Manage CORS settings
            services.AddCors(options =>
            {
                options.AddPolicy("AllowOrigins", 
                    options => options.WithOrigins(Configuration["CorsOrigins"].Split(',')).AllowAnyHeader().AllowAnyMethod());
            });

            // Configure AuthN and AuthZ
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddMicrosoftIdentityWebApi(Configuration, "AzureAd");

            services.AddAuthorization(c => c.AddPolicy("AADOAuth", p =>
            {
                p.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
                p.RequireAuthenticatedUser();
                p.RequireClaim("http://schemas.microsoft.com/identity/claims/scope", "Meetings.Interact");
            }));

            // Register the MemoryCache
            services.AddMemoryCache();

            // Switch to Newtonsoft
            services.AddHttpClient().AddControllers().AddNewtonsoftJson();

            // Create the Bot Framework Adapter with error handling enabled.
            services.AddSingleton<IBotFrameworkHttpAdapter, AdapterWithErrorHandler>();

            // Create the bot as a transient. In this case the ASP Controller is expecting an IBot.
            services.AddTransient<IBot, TeamsConversationBot>();

            // Configure the Sql Repository for meetings
            services.AddDbContext<MeetingsContext>(options =>
            {
                options.UseSqlServer(Configuration["ConnectionStrings:MeetingsDb"]);
            });

            // Register the Meeting Storage service instance as transient.
            services.AddTransient<IMeetingsRepository, MeetingsRepositorySql>();

            // Register the Proactive Messaging utility class
            services.AddTransient<ProactiveMessaging, ProactiveMessaging>();

            // Register the Microsoft Graph SDK
            services.AddScoped<IAuthenticationProvider,
                Microsoft.Graph.Auth.ClientCredentialProvider>(sp => {
                    IConfidentialClientApplication clientApplication = ConfidentialClientApplicationBuilder
                        .Create(Configuration["AzureAd:ClientId"])
                        .WithTenantId(Configuration["AzureAd:TenantId"])
                        .WithClientSecret(Configuration["AzureAd:ClientSecret"])
                        .Build();

                    return new Microsoft.Graph.Auth.ClientCredentialProvider(clientApplication);
                });
            services.AddScoped(sp =>
            {
                return new GraphServiceClient(sp.GetRequiredService<IAuthenticationProvider>());
            });

            // Add the voting service
            services.AddScoped(typeof(Services.VotingService));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Initialize the EF Core context and check if we need to updated the db schema
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var meetingsRepository = scope.ServiceProvider.GetService<IMeetingsRepository>();
                if (meetingsRepository != null)
                {
                    meetingsRepository.Init();
                }
            }

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles()
                .UseStaticFiles()
                .UseRouting()
                .UseCors("AllowOrigins")
                .UseAuthentication()
                .UseAuthorization()
                .UseEndpoints(endpoints =>
                {
                    endpoints.MapControllers().RequireCors("AllowOrigins");
                });

            // app.UseHttpsRedirection();
        }
    }
}
