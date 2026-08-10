namespace _66SMS.Contract.Settings
{
    public class ClientAppSettings
    {
        public const string SectionName = "ClientAppSettings";

        public string BaseUrl { get; set; } = string.Empty;
        public string ResetPasswordPath { get; set; } = "/reset-password";
    }
}
