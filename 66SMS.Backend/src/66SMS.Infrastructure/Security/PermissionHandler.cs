using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Shared;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
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
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            RequirePermissionAttribute requirement)
        {
            // Admin bypass theo role claim
            if (context.User.IsInRole("admin"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            // Permissions nằm trong claim "profile" (JSON TokenUserProfileDto)
            var profileJson = context.User.FindFirstValue(JwtClaimConst.Profile);
            if (!string.IsNullOrEmpty(profileJson))
            {
                var profile = JsonConvert.DeserializeObject<TokenUserProfileDto>(profileJson);
                if (profile?.Permissions != null
                    && profile.Permissions.Contains(requirement.Permission))
                {
                    context.Succeed(requirement);
                    return Task.CompletedTask;
                }
            }

            context.Fail();
            return Task.CompletedTask;
        }
    }
}
