using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace _66SMS.Application.IdentityService.Auth.Commands.ForgotPassword
{
    /// <summary>
    /// Handler for <see cref="ForgotPasswordCommand"/>
    /// </summary>
    public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IEmailService emailService;
        private readonly IEmailTemplateFactory emailTemplate;
        private readonly ClientAppSettings clientApp;
        private readonly ILogger<ForgotPasswordHandler> logger;

        public ForgotPasswordHandler(
            IUserSqlRepository userSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IEmailService emailService,
            IEmailTemplateFactory emailTemplate,
            IOptions<ClientAppSettings> clientApp,
            ILogger<ForgotPasswordHandler> logger)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.emailService = emailService;
            this.emailTemplate = emailTemplate;
            this.clientApp = clientApp.Value;
            this.logger = logger;
        }

        public async Task<Result<object>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            // Chuẩn hóa email để tra cứu không phân biệt hoa/thường
            string email = request.Email!.Trim().ToLowerInvariant();

            // Find user with email and tracking
            User? user = await userSqlRepository
                .AsQueryable(false)
                .Where(x => x.Email.ToLower() == email)
                .FirstOrDefaultAsync(cancellationToken);

            // Luôn trả về Ok dù không tìm thấy user để tránh lộ email nào tồn tại (chống user enumeration)
            if (user == null)
                return Result<object>.Ok();

            // Sinh token thật (gửi qua email) và lưu BẢN HASH vào DB
            string rawToken = GenerateTokenHelper.Generate();
            user.PasswordResetToken = GenerateTokenHelper.Hash(rawToken);
            user.PasswordResetTokenExpiry = DateTimeHelper.UtcNow().AddHours(MailConst.Expiry.PasswordResetTokenHours);

            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            // Dựng link reset từ cấu hình thay vì hard-code
            string resetLink =
                $"{clientApp.BaseUrl.TrimEnd('/')}{clientApp.ResetPasswordPath}" +
                $"?token={rawToken}&email={Uri.EscapeDataString(user.Email)}";

            // Gửi mail trong try/catch: lỗi gửi mail không được làm lộ user tồn tại, chỉ log lại
            try
            {
                var mailMessage = emailTemplate.CreatePasswordReset(user.Email, user.Username, resetLink);
                await emailService.SendAsync(mailMessage, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Gửi email đặt lại mật khẩu thất bại cho user {UserId}", user.Id);
            }

            return Result<object>.Ok();
        }
    }
}
