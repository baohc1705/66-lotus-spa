using System.Security.Claims;
using _66SMS.Contracts.Shared;

namespace _66SMS.Contracts.Abstractions
{
    public interface IJwtService
    {
        /// <summary>
        /// Sinh JWT. Role/permissions/salonId nằm trong profile (claim "profile" JSON).
        /// </summary>
        string GenerateAccessToken(TokenUserProfileDto profile);

        string GenerateRefreshToken();
        ClaimsPrincipal? ValidateToken(string token);
        TEntity? GetClaim<TEntity>(string claimType);
        int GetUserId();
        TokenUserProfileDto? GetProfile();

        /// <summary>SalonId từ profile.StaffProfile (token mới).</summary>
        int? GetSalonId();
    }
}
