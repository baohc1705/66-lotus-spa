using _66SMS.Contracts.Abstractions;
using Microsoft.AspNetCore.Http;

namespace _66SMS.Infrastructure.Security
{
    public class ClientIpService(IHttpContextAccessor httpContextAccessor) : IClientIpService
    {
        public string GetClientIpAddress()
        {
            var httpContext = httpContextAccessor.HttpContext
                ?? throw new InvalidOperationException("HttpContext is not available.");

            string? ip = null;

            if (httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var forwarded))
            {
                var raw = forwarded.ToString();
                if (!string.IsNullOrWhiteSpace(raw))
                    ip = raw.Split(',')[0].Trim();
            }

            ip ??= httpContext.Connection.RemoteIpAddress?.MapToIPv4()?.ToString();

            if (string.IsNullOrWhiteSpace(ip) || ip == "0.0.0.0")
                return "127.0.0.1";

            return ip;
        }
    }
}
