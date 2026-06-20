using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.IdentityService.Auth.Commands.RefreshTokens
{
    public class RefreshTokenCommand : IRequest<Result<TokenResponseDTO>>
    {
        public string Token { get; set; } = null!;

        [JsonIgnore]
        public string? IpAddress { get; set; }
    }
}
