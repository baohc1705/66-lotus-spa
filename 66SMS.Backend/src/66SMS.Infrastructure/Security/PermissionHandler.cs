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
        private readonly IUserRoleSqlRepository userRoleSqlRepository;

        public PermissionHandler(IUserRoleSqlRepository userRoleSqlRepository)
        {
            this.userRoleSqlRepository = userRoleSqlRepository;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, RequirePermissionAttribute requirement)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                context.Fail();
                return;
            }

            Role? role = await userRoleSqlRepository.GetRoleByUserIdAsync(userId, CancellationToken.None);
            if (role == null)
            {
                context.Fail();
                return;
            }

            List<string>? permissions = await userRoleSqlRepository.GetPermissionKeysByUserIdAndRoleIdAsync(
                userId,
                role.Id,
                CancellationToken.None);

            if (permissions != null && permissions.Contains(requirement.Permission))
                context.Succeed(requirement);
            else
                context.Fail();
        }
    }
}
