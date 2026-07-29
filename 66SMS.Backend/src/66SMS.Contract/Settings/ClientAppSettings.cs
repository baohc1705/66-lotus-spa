namespace _66SMS.Contracts.Settings
{
    public class ClientAppSettings
    {
        public const string SectionName = "ClientAppSettings";

        public string BaseUrl { get; set; } = string.Empty;
        public string ResetPasswordPath { get; set; } = "/reset-password";
    }
}
