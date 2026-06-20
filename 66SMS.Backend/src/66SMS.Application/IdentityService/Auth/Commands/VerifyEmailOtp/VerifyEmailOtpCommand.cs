using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Auth.Commands.VerifyEmailOtp
{
    public record VerifyEmailOtpCommand : IRequest<Result<object>>
    {
        public string? Email { get; set; }
        public string? OtpCode { get; set; }
    }
}
