namespace Contoso.Retail.Demo.Backend.Model
{
    public class ReturnVolumesData: BaseResponse
    {
        public int MaximumReturns { get; set; }

        public int MaximumInventory { get; set; }

        public int CurrentReturns { get; set; }

        public int CurrentInventory { get; set; }

        public List<MonthlyReturn> MonthlyReturns { get; set; }
    }

    public class MonthlyReturn
    {
        public int Month { get; set; }

        public int Returns { get; set; }

        public int Inventory { get; set; }
    }
}
