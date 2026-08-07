namespace _66SMS.Contracts.Settings
{
    /// <summary>
    /// Cấu hình RabbitMQ / CloudAMQP.
    /// </summary>
    public class RabbitMqSettings
    {
        public const string SectionName = "RabbitMqSettings";
        public string Host { get; set; } = "localhost";
        public int Port { get; set; } = 5672;
        public string VirtualHost { get; set; } = "/";
        public string Username { get; set; } = "guest";
        public string Password { get; set; } = "guest";
        public bool UseSsl { get; set; } = false;
    }
}
