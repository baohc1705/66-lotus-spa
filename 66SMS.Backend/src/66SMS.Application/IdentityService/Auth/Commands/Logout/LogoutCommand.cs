using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.IdentityService.Auth.Commands.Logout
{
    /// <summary>
    /// Logout request
    /// </summary>
    public class LogoutCommand : IRequest<Result<object>>
    {
        public string Token { get; set; } = null!;
        [JsonIgnore]
        public string? IpAddress { get; set; }
    }
}
