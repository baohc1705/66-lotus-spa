using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Users.Commands.CreateUser
{
    public class CreateUserCommand : IRequest<Result<object>>
    {
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string? Role { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }

    }
}
