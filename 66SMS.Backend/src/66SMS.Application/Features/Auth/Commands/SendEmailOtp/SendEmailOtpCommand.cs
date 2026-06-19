using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.SendEmailOtp
{
    public record SendEmailOtpCommand : IRequest<Result<object>>
    {
        public string? Email { get; set; }
    }
}
