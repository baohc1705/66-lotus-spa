using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace _66SMS.Infrastructure.Security
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequirePermissionAttribute(string resource, string action) : Attribute, IAuthorizationRequirement
    {
        public string Permission { get; } = $"{resource}:{action}";
    }

    public class PermissionHandler : AuthorizationHandler<RequirePermissionAttribute>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RequirePermissionAttribute requirement)
        {
            // Kiểm tra xem trong JWT payload có chứa permission (có phân biệt hoa/thường)
            if (context.User.HasClaim(c => c.Type == "permission" && c.Value == requirement.Permission))
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }
            
            return Task.CompletedTask;
        }
    }
}
