using _66SMS.API.DependencyInjection.Options;
using _66SMS.API.Commons;
using Asp.Versioning.ApiExplorer;

namespace _66SMS.API.DependencyInjection.Extensions
{
    public static class SwaggerExtensions
    {
        public static IServiceCollection AddSwaggerWithJwt(this IServiceCollection services, ApiConfig apiConfig)
        {
            services.AddSingleton(apiConfig);
            services.AddSwaggerGen();
            services.ConfigureOptions<SwaggerConfigureOptions>();
            return services;
        }
        public static WebApplication UseSwaggerWithUi(this WebApplication app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

                foreach (var description in provider.ApiVersionDescriptions)
                {
                    options.SwaggerEndpoint(
                        $"/swagger/{description.GroupName}/swagger.json",
                        $"{description.GroupName.ToUpperInvariant()}"
                    );
                }
            });
            return app;
        }
    }
}
