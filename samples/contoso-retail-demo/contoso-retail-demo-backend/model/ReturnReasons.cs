namespace Contoso.Retail.Demo.Backend.Model
{
    public class ReturnReasons: BaseResponse
    {
        public int IncorrectFit { get; set; }

        public int Defective { get; set; }

        public int WrongItem { get; set; }

        public int Disliked { get; set; }
        
        public int WrongSize { get; set; }
    }
}
