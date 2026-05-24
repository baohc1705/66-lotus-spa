using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Auth.Commands.Logout
{
    public class LogoutCommand : IRequest<Result<object>>
    {
        public string Token { get; set; }
        [JsonIgnore]
        public string IpAddress { get; set; }
    }
}
