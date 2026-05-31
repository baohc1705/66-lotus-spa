using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.ResetPassword
{
    public record ResetPasswordCommand : IRequest<Result<object>>
    {
        public string? Email { get; set; }
        public string? Token { get; set; }
        public string? NewPassword { get; set; }
        public string? ConfirmPassword { get; set; }
    }
}
