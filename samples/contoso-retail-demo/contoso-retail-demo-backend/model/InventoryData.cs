namespace Contoso.Retail.Demo.Backend.Model
{
    public class InventoryData: BaseResponse
    {
        public DateTime InventoryDate { get; set; }

        public int WomenItems { get; set; }

        public int MenItems { get; set; }

        public int AccessoriesItems { get; set; }

        public int HandbagsItems { get; set; }

        public int SalesItems { get; set; }
    }
}
