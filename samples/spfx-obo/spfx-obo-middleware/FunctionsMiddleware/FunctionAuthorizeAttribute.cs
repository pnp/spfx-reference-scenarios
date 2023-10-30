using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Net;
using Microsoft.Identity.Web;

namespace PnP.SPFxOBO.Middleware.FunctionsMiddleware
{
    /// <summary>
    /// Custom attribute to provide custom authorization logic for Funtion App functions
    /// </summary>
    /// <remarks>
    /// This attribute can only be applied to methods
    /// </remarks>
    [AttributeUsage(AttributeTargets.Method)]
    internal class FunctionAuthorizeAttribute : Attribute
    {
        /// <summary>
        /// Defines which scopes (aka delegated permissions)
        /// are accepted. In this sample these
        /// must be combined with <see cref="UserRoles"/>.
        /// </summary>
        public string[] Scopes { get; set; } = Array.Empty<string>();

        /// <summary>
        /// Defines whether to run the request on-behalf-of the current user
        /// </summary>
        public bool RunOnBehalfOf { get; set; }
    }
}
