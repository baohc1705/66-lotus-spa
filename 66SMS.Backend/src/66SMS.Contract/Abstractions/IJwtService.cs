using System.Security.Claims;

namespace _66SMS.Contracts.Abstractions
{
    public interface IJwtService
    {
        string GenerateAccessToken<TEntity>(TEntity entity, string role, List<string> permissions);
        string GenerateRefreshToken();
        ClaimsPrincipal? ValidateToken(string token);
        TEntity? GetClaim<TEntity>(string claimType);
        int GetUserId();
    }
}
