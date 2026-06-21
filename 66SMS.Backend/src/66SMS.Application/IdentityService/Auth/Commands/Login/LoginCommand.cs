using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.IdentityService.Auth.Commands.Login
{
    /// <summary>
    /// Request for login
    /// </summary>
    public class LoginCommand : IRequest<Result<TokenResponseDTO>>
    {
        public string UsernameOrEmail { get; set; } = null!;
        public string Password { get; set; } = null!;
        [JsonIgnore]
        public string? IpAddress { get; set; }
    }
}
