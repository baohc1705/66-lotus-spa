using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Auth.Commands.ChangePassword
{
    /// <summary>
    /// Request to change password
    /// </summary>
    public record ChangePasswordCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
        public string? ConfirmPassword { get; set; }
    }
}
