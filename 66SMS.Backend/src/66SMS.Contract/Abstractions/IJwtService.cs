using System.Security.Claims;

namespace _66SMS.Contracts.Abstractions
{
    public interface IJwtService
    {
        string GenerateAccessToken<TEntity>(TEntity entity, string role, List<string> permissions, int? salonId = null);
        string GenerateRefreshToken();
        ClaimsPrincipal? ValidateToken(string token);
        TEntity? GetClaim<TEntity>(string claimType);
        int GetUserId();
    }
}
