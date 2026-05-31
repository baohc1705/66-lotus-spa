using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace _66SMS.Infrastructure.Security
{
    public class PermissionPolicyProvider : IAuthorizationPolicyProvider
    {
        private readonly DefaultAuthorizationPolicyProvider fallback;

        public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
        {
            fallback = new DefaultAuthorizationPolicyProvider(options);
        }

        public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => fallback.GetDefaultPolicyAsync();

        public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => fallback.GetFallbackPolicyAsync();

        public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
        {
            // policyName sẽ có dạng "permission:users:read"
            if (policyName.StartsWith("permission:"))
            {
                var parts = policyName["permission:".Length..].Split(':');
                if (parts.Length == 2)
                {
                    var policy = new AuthorizationPolicyBuilder().AddRequirements(new RequirePermissionAttribute(parts[0], parts[1])).Build();
                    return Task.FromResult<AuthorizationPolicy?>(policy);
                }
            }

            return fallback.GetPolicyAsync(policyName);
        }
    }
}
