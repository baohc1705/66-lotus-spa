using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.RefreshTokens
{
    /// <summary>
    /// Token có thể rỗng ở body — AuthController sẽ lấy từ cookie HttpOnly.
    /// Handler tự kiểm tra sau khi merge cookie.
    /// </summary>
    public class RefreshTokenValidator : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenValidator()
        {
            // Không bắt NotEmpty ở đây: FE silent-refresh gửi { token: "" } + cookie.
        }
    }
}
