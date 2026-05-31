using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace _66SMS.API.DependencyInjection.Options
{
    public class AuthorizeCheckOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Check cả controller lẫn action
            var hasAuthorize = context.MethodInfo.DeclaringType!.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any() || 
                context.MethodInfo.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any();

            // Check [AllowAnonymous] để loại trừ
            var hasAllowAnonymous = context.MethodInfo.DeclaringType!.GetCustomAttributes(true).OfType<AllowAnonymousAttribute>().Any() || 
                context.MethodInfo.GetCustomAttributes(true).OfType<AllowAnonymousAttribute>().Any();

            if (!hasAuthorize || hasAllowAnonymous) return;

            operation.Security = new List<OpenApiSecurityRequirement>
            {
                new()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                }
            };
        }
    }
}
