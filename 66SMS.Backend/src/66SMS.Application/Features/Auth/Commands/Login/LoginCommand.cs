using _66SMS.Application.DTOs.Identity;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Auth.Commands.Login
{
    public class LoginCommand : IRequest<Result<TokenResponseDTO>>
    {
        public string UsernameOrEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        [JsonIgnore]
        public string IpAddress { get; set; } = string.Empty;
    }
}
