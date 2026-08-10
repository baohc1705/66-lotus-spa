using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Auth.Commands.VerifyEmailOtp
{
    /// <summary>
    /// Verify otp request
    /// </summary>
    public record VerifyEmailOtpCommand : IRequest<Result<object>>
    {
        public string? Email { get; set; }
        public string? OtpCode { get; set; }
    }
}
