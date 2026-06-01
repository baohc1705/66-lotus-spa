using System.Security.Claims;

namespace _66SMS.Contracts.Abstractions
{
    public interface IJwtService
    {
        string GenerateAccessToken<TEntity>(TEntity entity, string role);
        string GenerateRefreshToken();
        ClaimsPrincipal? ValidateToken(string token);
        TEntity? GetClaim<TEntity>(string claimType);
        int GetUserId();
    }
}
