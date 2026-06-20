using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Auth.Commands.ForgotPassword
{
    public record ForgotPasswordCommand : IRequest<Result<object>>
    {
        public string? Email {get; set;}
    }
}
