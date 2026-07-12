using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.Logout
{
    /// <summary>
    /// Token lấy từ cookie ở AuthController; có thể rỗng nếu cookie đã mất.
    /// </summary>
    public class LogoutValidator : AbstractValidator<LogoutCommand>
    {
        public LogoutValidator()
        {
        }
    }
}
