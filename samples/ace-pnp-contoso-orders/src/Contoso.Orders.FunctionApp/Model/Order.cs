using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Text;

namespace Contoso.Orders.FunctionApp.Model
{
    /// <summary>
    /// Represents an Order of the Contoso Ordering system
    /// </summary>
    public class Order
    {
        /// <summary>
        /// The ID of the order
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// The reference customer for the current order
        /// </summary>
        public string CustomerId { get; set; }

        /// <summary>
        /// The date of creation for the current order
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// The status of the current order
        /// </summary>
        [JsonConverter(typeof(StringEnumConverter))]
        public OrderStatus Status { get; set; }

        /// <summary>
        /// The items of the current order
        /// </summary>
        public List<OrderItem> Items { get; set; }
    }

    /// <summary>
    /// Represents a single row of an Order
    /// </summary>
    public class OrderItem
    {
        /// <summary>
        /// The ID of a row in a order
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// The ID of the product for the current order row
        /// </summary>
        public string ProductId { get; set; }

        /// <summary>
        /// The quantity of items in the current order row
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// The price of a single item in the current order row
        /// </summary>
        public decimal Price { get; set; }
    }

    /// <summary>
    /// Defines the available values for the Order Status
    /// </summary>
    public enum OrderStatus
    {
        /// <summary>
        /// Order just inserted
        /// </summary>
        Inserted,
        /// <summary>
        /// Order under processing
        /// </summary>
        Processing,
        /// <summary>
        /// Order processed and ready to be shipped
        /// </summary>
        Processed,
        /// <summary>
        /// Order shipped
        /// </summary>
        Shipped,
        /// <summary>
        /// Order delivered
        /// </summary>
        Delivered,
        /// <summary>
        /// Order closed
        /// </summary>
        Closed,
        /// <summary>
        /// Order cancelled
        /// </summary>
        Cancelled
    }
}
