namespace Contoso.Retail.Demo.Backend.Model
{
    public class QuarterlyRevenuesData: BaseResponse
    {
        public List<QuarterlyRevenue> Revenues { get; set; }
    }

    public class QuarterlyRevenue
    {
        public int Quarter { get; set; }

        public double Revenues { get; set; }
    }
}
