using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Helpers;
using Microsoft.AspNetCore.Http;

namespace _66SMS.Infrastructure.Security
{
    public class CookieService(IHttpContextAccessor httpContextAccessor) : ICookieService
    {
        private HttpContext HttpContext =>
            httpContextAccessor.HttpContext
            ?? throw new InvalidOperationException("HttpContext is not available.");

        public void SetRefreshToken(string token)
        {
            var cookieOptions = CreateCookieOptions(DateTimeHelper.UtcNow().AddDays(CookieConst.RefreshTokenExpireDays));
            HttpContext.Response.Cookies.Append(CookieConst.RefreshToken, token, cookieOptions);
        }

        public void DeleteRefreshToken()
        {
            HttpContext.Response.Cookies.Delete(CookieConst.RefreshToken, CreateCookieOptions());
        }

        public string? GetRefreshToken()
        {
            return HttpContext.Request.Cookies[CookieConst.RefreshToken];
        }

        private static CookieOptions CreateCookieOptions(DateTimeOffset? expires = null) => new()
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/",
            Expires = expires
        };
    }
}
