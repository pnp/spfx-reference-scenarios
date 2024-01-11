using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Abstractions;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PnP.Ace.ExpenseReport.Backend
{
    public class OpenApiConfigurationOptions : IOpenApiConfigurationOptions
    {
        public OpenApiInfo Info { get; set; } =
          new OpenApiInfo
          {
              Title = "PnP.Ace.ExpenseReport.Backend",
              Version = "1.0",
              Description = "PnP.Ace.ExpenseReport.Backend documentation",
              Contact = new OpenApiContact()
              {
                  Name = "PnP Expense Reports Demo",
                  Url = new Uri("https://pnp.github.io/"),
              },
              //License = new OpenApiLicense()
              //{
              //    Name = "MIT",
              //    Url = new Uri("http://opensource.org/licenses/MIT"),
              //}
          };

        public List<OpenApiServer> Servers { get; set; } = new();

        public OpenApiVersionType OpenApiVersion { get; set; } = OpenApiVersionType.V3;

        public bool IncludeRequestingHostName { get; set; } = false;
        public bool ForceHttp { get; set; } = false;
        public bool ForceHttps { get; set; } = false;
        public List<IDocumentFilter> DocumentFilters { get; set; } = new();
    }
}
