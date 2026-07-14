using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace _66SMS.API.Filters
{
    /// <summary>
    /// Rate limit theo Redis. Policy: login | otp | forgot | register.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public sealed class RedisRateLimitAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string _policy;

        public RedisRateLimitAttribute(string policy)
        {
            _policy = policy;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var rateLimit = context.HttpContext.RequestServices.GetRequiredService<IRateLimitService>();
            var settings = context.HttpContext.RequestServices.GetRequiredService<IOptions<RedisSettings>>().Value;

            var (limit, keyPrefix) = _policy.ToLowerInvariant() switch
            {
                "login" => (settings.LoginLimitPerMinute, "login"),
                "otp" => (settings.OtpLimitPerMinute, "otp"),
                "forgot" => (settings.ForgotPasswordLimitPerMinute, "forgot"),
                "register" => (settings.RegisterLimitPerMinute, "register"),
                _ => (10, _policy),
            };

            var ip = context.HttpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var forwarded)
                ? forwarded.ToString().Split(',')[0].Trim()
                : context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            var allowed = await rateLimit.IsAllowedAsync(
                $"{keyPrefix}:{ip}",
                limit,
                TimeSpan.FromMinutes(1),
                context.HttpContext.RequestAborted);

            if (!allowed)
            {
                var result = Result<object>.TooManyRequests("Too many requests. Please try again later.");
                context.Result = new ObjectResult(result) { StatusCode = 429 };
                return;
            }

            await next();
        }
    }
}
