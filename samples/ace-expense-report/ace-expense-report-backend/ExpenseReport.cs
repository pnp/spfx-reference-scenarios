using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PnP.Ace.ExpenseReport.Backend
{
    public class ExpenseReport
    {
        public string ReceiptFileName { get; set; }
        public string ReceiptContent { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string Date { get; set; }
    }
}
