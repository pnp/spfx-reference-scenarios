namespace Contoso.Retail.Demo.Backend.Model
{
    public class CustomerSatisfaction: BaseResponse
    {
        public int CStat { get; set; }

        public int NStat { get; set; }

        public int Tts { get; set; }
    }
}
