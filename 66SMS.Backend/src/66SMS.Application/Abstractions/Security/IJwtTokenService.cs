using _66SMS.Domain.Entities;

namespace _66SMS.Application.Abstractions.Security
{
    public interface IJwtTokenService
    {
        string GenerateAccessToken(User user, IList<string> permissions);
        string GenerateRefreshToken();
    }
}
