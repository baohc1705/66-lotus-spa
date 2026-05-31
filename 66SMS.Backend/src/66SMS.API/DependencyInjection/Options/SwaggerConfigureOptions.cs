using _66SMS.Presentation.Commons;
using Asp.Versioning.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace _66SMS.API.DependencyInjection.Options
{
    public class SwaggerConfigureOptions : IConfigureNamedOptions<SwaggerGenOptions>
    {
        private readonly IApiVersionDescriptionProvider provider;
        private readonly ApiConfig apiConfig;
        public SwaggerConfigureOptions(IApiVersionDescriptionProvider provider, ApiConfig apiConfig)
        {
            this.provider = provider;
            this.apiConfig = apiConfig;
        }
        public void Configure(SwaggerGenOptions options)
        {
            foreach(var description in provider.ApiVersionDescriptions)
            {
                options.SwaggerDoc(description.GroupName, new OpenApiInfo
                {
                    Title = apiConfig.Name,
                    Version = description.ApiVersion.ToString(),
                    Description = description.IsDeprecated ? "Phien ban ngay ngung ho tro" : null
                });
            }

            // JWT Security Definition
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Nhap token cua ban o day."
            });

            options.OperationFilter<AuthorizeCheckOperationFilter>();
        }

        public void Configure(string? name, SwaggerGenOptions options) => Configure(options);

       
    }
}
