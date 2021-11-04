using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Contoso.Orders.FunctionApp.Model;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Contoso.Orders.FunctionApp
{
    /// <summary>
    /// Actual Orders function
    /// </summary>
    public class OrdersFunction
    {
        /// <summary>
        /// Fake list of orders for the sake of demo purposes
        /// </summary>
        public static readonly Dictionary<string, List<Order>> Orders = 
            new Dictionary<string, List<Order>>();

        /// <summary>
        /// Redirects an admin to the API Access page of SPO
        /// </summary>
        /// <param name="req">The request</param>
        /// <param name="log">The logging interface</param>
        [FunctionName("GrantPermissions")]
        public IActionResult GrantPermissions(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "grant")] HttpRequest req,
            ILogger log)
        {
            log.LogInformation($"GrantPermissions invoked.");

            string tenantName = req.Query.ContainsKey("state") ? req.Query["state"].ToString() : null;
            if (!string.IsNullOrEmpty(tenantName))
            {
                var apiAccessUrl = $"https://{tenantName}-admin.sharepoint.com/_layouts/15/online/AdminHome.aspx#/webApiPermissionManagement";
                return new RedirectResult(apiAccessUrl);
            }
            else
            {
                return new BadRequestResult();
            }
        }

        /// <summary>
        /// Provides the list of orders
        /// </summary>
        /// <param name="req">The request</param>
        /// <param name="log">The logging interface</param>
        /// <returns>The list of orders</returns>
        [FunctionAuthorize(Scopes = "Orders.Read,Orders.FullControl")]
        [FunctionName("GetOrders")]
        public IActionResult GetOrders(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "orders")] HttpRequest req,
            ILogger log)
        {
            var claimsPrincipal = req.HttpContext.User;

            log.LogInformation($"GetOrders invoked.");
            LogUserInfo(log, claimsPrincipal);

            return new OkObjectResult(GetOrdersForUser(claimsPrincipal));
        }

        /// <summary>
        /// Provides a specific order
        /// </summary>
        /// <param name="req">The request</param>
        /// <param name="log">The logging interface</param>
        /// <param name="id">The ID of the order to retrieve</param>
        /// <returns>The retrieved order, if any</returns>
        [FunctionAuthorize(Scopes = "Orders.Read,Orders.FullControl")]
        [FunctionName("GetOrder")]
        public IActionResult GetOrder(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "orders/{id}")] HttpRequest req,
            ILogger log,
            string id)
        {
            var claimsPrincipal = req.HttpContext.User;

            log.LogInformation($"GetOrder invoked for order: {id}.");
            LogUserInfo(log, claimsPrincipal);

            var orders = GetOrdersForUser(claimsPrincipal);
            var order = orders.FirstOrDefault(o => o.Id == id);
            if (order != null)
            {
                return new OkObjectResult(order);
            }
            else
            {
                return new NotFoundResult();
            }
        }

        /// <summary>
        /// Adds a new order
        /// </summary>
        /// <param name="req">The request</param>
        /// <param name="log">The logging interface</param>
        /// <returns>The inserted order</returns>
        [FunctionAuthorize(Scopes = "Orders.FullControl")]
        [FunctionName("AddOrder")]
        public async Task<IActionResult> AddOrder(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "orders")] HttpRequest req,
            ILogger log)
        {
            var claimsPrincipal = req.HttpContext.User;

            log.LogInformation($"AddOrder invoked.");
            LogUserInfo(log, claimsPrincipal);

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var newOrder = JsonConvert.DeserializeObject<Order>(requestBody);

            var orders = GetOrdersForUser(claimsPrincipal);
            orders.Add(newOrder);
            UpdateOrdersForUser(orders, claimsPrincipal);

            return new OkObjectResult(newOrder);
        }

        /// <summary>
        /// Updates a specific order
        /// </summary>
        /// <param name="req">The request</param>
        /// <param name="log">The logging interface</param>
        /// <param name="id">The ID of the order to update</param>
        /// <returns>The updated order, if any</returns>
        [FunctionAuthorize(Scopes = "Orders.FullControl")]
        [FunctionName("UpdateOrder")]
        public async Task<IActionResult> UpdateOrder(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "orders/{id}")] HttpRequest req,
            ILogger log,
            string id)
        {
            var claimsPrincipal = req.HttpContext.User;

            log.LogInformation($"UpdateOrder invoked for order: {id}.");
            LogUserInfo(log, claimsPrincipal);

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var updatedOrder = JsonConvert.DeserializeObject<Order>(requestBody);

            var orders = GetOrdersForUser(claimsPrincipal);
            var orderToUpdate = orders.FindIndex(o => o.Id == updatedOrder.Id);
            if (orderToUpdate >= 0)
            {
                orders[orderToUpdate] = updatedOrder;
                UpdateOrdersForUser(orders, claimsPrincipal);
                return new OkObjectResult(updatedOrder);
            }
            else
            {
                return new NotFoundResult();
            }
        }

        /// <summary>
        /// Deletes a specific order
        /// </summary>
        /// <param name="req">The request</param>
        /// <param name="log">The logging interface</param>
        /// <param name="id">The ID of the order to delete</param>
        [FunctionAuthorize(Scopes = "Orders.FullControl")]
        [FunctionName("DeleteOrder")]
        public IActionResult DeleteOrder(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "orders/{id}")] HttpRequest req,
            ILogger log,
            string id)
        {
            var claimsPrincipal = req.HttpContext.User;

            log.LogInformation($"DeleteOrder invoked for order: {id}.");
            LogUserInfo(log, claimsPrincipal);

            var orders = GetOrdersForUser(claimsPrincipal);
            var orderToDelete = orders.FindIndex(o => o.Id == id);
            if (orderToDelete >= 0)
            {
                orders.RemoveAt(orderToDelete);
                UpdateOrdersForUser(orders, claimsPrincipal);
                return new OkResult();
            }
            else
            {
                return new NotFoundResult();
            }
        }

        private void LogUserInfo(ILogger log, ClaimsPrincipal claimsPrincipal)
        {
            if (claimsPrincipal != null &&
                claimsPrincipal.Identity != null &&
                claimsPrincipal.Identity.IsAuthenticated)
            {
                log.LogInformation("Invoked by: {0}",
                    claimsPrincipal.Identity.Name);
            }
            else
            {
                log.LogInformation("No user's context information.");
            }
        }

        private List<Order> GetOrdersForUser(ClaimsPrincipal claimsPrincipal)
        {
            if (claimsPrincipal != null &&
                claimsPrincipal.Identity != null &&
                claimsPrincipal.Identity.IsAuthenticated)
            {
                var userId = ((ClaimsIdentity)claimsPrincipal.Identity).Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
                var userKey = userId ?? claimsPrincipal.Identity.Name;

                if (!Orders.ContainsKey(userKey))
                {
                    Orders[userKey] = GenerateNewSetOfOrders();
                }

                return Orders[userKey];
            }
            else
            {
                return GenerateNewSetOfOrders();
            }
        }

        private void UpdateOrdersForUser(List<Order> orders, ClaimsPrincipal claimsPrincipal)
        {
            if (claimsPrincipal != null &&
                claimsPrincipal.Identity != null &&
                claimsPrincipal.Identity.IsAuthenticated)
            {
                var userId = ((ClaimsIdentity)claimsPrincipal.Identity).Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
                var userKey = userId ?? claimsPrincipal.Identity.Name;

                Orders[userKey] = orders;
            }
        }

        public List<Order> GenerateNewSetOfOrders()
        {
            var rnd = new Random(DateTime.Now.Millisecond);

            // Generate 10 random orders, if the consumer is new
            var result = new List<Order>(
                from o in Enumerable.Range(1, 10)
                select new Order
                {
                    Id = $"{o.ToString("000")}-{DateTime.Now.Year}",
                    Date = DateTime.Now.AddDays(-1 * rnd.Next(1, 20)),
                    CustomerId = $"C{(o + 25).ToString("000")}",
                    Status =
                        o % 2 == 0 ? OrderStatus.Inserted :
                        o % 3 == 0 ? OrderStatus.Processed :
                        o % 5 == 0 ? OrderStatus.Shipped :
                        o % 7 == 0 ? OrderStatus.Cancelled :
                        OrderStatus.Closed,
                    Items = (
                        from i in Enumerable.Range(1, rnd.Next(1, 5))
                        select new OrderItem
                        {
                            Id = i,
                            ProductId = $"P{(i + rnd.Next(1, 100)).ToString("000")}",
                            Quantity = rnd.Next(1, 100),
                            Price = rnd.Next(1, 20) * 100
                        }
                             ).ToList()
                }
            );

            return result;
        }
    }
}
