namespace _66SMS.API.DependencyInjection.Extensions
{
    public static class CorsExtensions
    {
        public const string PolicyName = "AllowFrontend";
        public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
        {
            var allowedOrigins = configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();

            services.AddCors(options =>
            {
                options.AddPolicy(PolicyName, policy =>
                {
                    policy.WithOrigins(allowedOrigins!)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            return services;
        }
    }
}
