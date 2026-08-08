namespace _66SMS.Contract.Settings
{
    /// <summary>
    /// Config mapping vnpay setting
    /// </summary>
    public class VnPaySettings
    {
        public static string SectionName => "VnPaySettings";
        public string TmnCode { get; set; } = string.Empty;
        public string HashSecret { get; set; } = string.Empty;
        public string PaymentUrl { get; set; } = string.Empty;
        public string ReturnUrl { get; set; } = string.Empty;
    }
}
