using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Settings;
using _66SMS.Contract.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace _66SMS.API.Filters
{
    /// <summary>
    /// Rate limit attribute for Redis.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public sealed class RedisRateLimitAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string policy;

        public RedisRateLimitAttribute(string policy)
        {
            this.policy = policy;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var rateLimit = context.HttpContext.RequestServices.GetRequiredService<IRateLimitService>();
            var settings = context.HttpContext.RequestServices.GetRequiredService<IOptions<RedisSettings>>().Value;

            var (limit, keyPrefix) = policy.ToLowerInvariant() switch
            {
                "login" => (settings.LoginLimitPerMinute, "login"),
                "otp" => (settings.OtpLimitPerMinute, "otp"),
                "forgot" => (settings.ForgotPasswordLimitPerMinute, "forgot"),
                "register" => (settings.RegisterLimitPerMinute, "register"),
                _ => (10, policy),
            };

            var ip = context.HttpContext.RequestServices
                .GetRequiredService<IClientIpService>()
                .GetClientIpAddress();

            var allowed = await rateLimit.IsAllowedAsync($"{keyPrefix}:{ip}", limit, TimeSpan.FromMinutes(1), context.HttpContext.RequestAborted);

            if (!allowed)
            {
                var result = Result<object>.TooManyRequests("Too many requests. Please try again later.");
                context.Result = new ObjectResult(result)
                {
                    StatusCode = 429
                };
                return;
            }

            await next();
        }
    }
}
