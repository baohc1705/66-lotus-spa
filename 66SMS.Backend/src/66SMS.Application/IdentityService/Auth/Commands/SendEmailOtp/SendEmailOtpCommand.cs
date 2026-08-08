using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Auth.Commands.SendEmailOtp
{
    /// <summary>
    /// Request for send email otp
    /// </summary>
    public record SendEmailOtpCommand : IRequest<Result<object>>
    {
        public string? Email { get; set; }
    }
}
