using System.Text.Json.Serialization;
using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.IdentityService.Auth.Commands.RefreshTokens
{
    /// <summary>
    /// Refresh token request
    /// </summary>
    public class RefreshTokenCommand : IRequest<Result<TokenResponseDTO>>
    {
        public string Token { get; set; } = null!;

        [JsonIgnore]
        public string? IpAddress { get; set; }
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
