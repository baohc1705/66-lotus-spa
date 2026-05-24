using _66SMS.Application.DTOs.Identity;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Auth.Commands.RefreshTokens
{
    public class RefreshTokenCommand : IRequest<Result<TokenResponseDTO>>
    {
        public string Token { get; set; }
        
        public string IpAddress { get; set; }
    }
}
