using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;

namespace _66SMS.Infrastructure.Security
{

    /// <summary>
    /// 
    /// </summary>
    /// <param name="resource"></param>
    /// <param name="action"></param>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequirePermissionAttribute(string resource, string action) : Attribute, IAuthorizationRequirement
    {
        public string Permission { get; } = $"{resource}:{action}";
    }
    /// <summary>
    /// 
    /// </summary>
    public class PermissionHandler : AuthorizationHandler<RequirePermissionAttribute>
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="context"></param>
        /// <param name="requirement"></param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RequirePermissionAttribute requirement)
        {
            var claim = context.User.FindFirst("permissions");
            if (claim is null) { context.Fail(); return Task.CompletedTask; }
            var permissions = JsonConvert.DeserializeObject<List<string>>(claim.Value);
            if (permissions != null && permissions.Contains(requirement.Permission))
                context.Succeed(requirement);
            else
                context.Fail();
            return Task.CompletedTask;
        }
    }
}
