namespace _66SMS.API.DependencyInjection.Extensions
{
    public static class HealthEndpointExtensions
    {
        public const string HealthPath = "/health";

        public static WebApplication MapHealthEndpoint(this WebApplication app)
        {
            app.MapGet(HealthPath, () => Results.Ok(new { status = "Healthy" }))
                .AllowAnonymous();

            return app;
        }
    }
}
