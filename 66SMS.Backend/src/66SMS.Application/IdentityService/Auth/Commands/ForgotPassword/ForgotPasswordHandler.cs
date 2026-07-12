using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Messages;
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
        private readonly IEmailTemplateFactory emailTemplate;
        private readonly IDomainEventPublisher domainEventPublisher;
        private readonly ClientAppSettings clientApp;
        private readonly ILogger<ForgotPasswordHandler> logger;

        public ForgotPasswordHandler(
            IUserSqlRepository userSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IEmailTemplateFactory emailTemplate,
            IDomainEventPublisher domainEventPublisher,
            IOptions<ClientAppSettings> clientApp,
            ILogger<ForgotPasswordHandler> logger)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.emailTemplate = emailTemplate;
            this.domainEventPublisher = domainEventPublisher;
            this.clientApp = clientApp.Value;
            this.logger = logger;
        }

        public async Task<Result<object>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            string email = request.Email!.Trim().ToLowerInvariant();

            User? user = await userSqlRepository
                .AsQueryable(false)
                .Where(x => x.Email.ToLower() == email)
                .FirstOrDefaultAsync(cancellationToken);

            // Luôn trả về Ok dù không tìm thấy user (chống user enumeration)
            if (user == null)
                return Result<object>.Ok();

            string rawToken = GenerateTokenHelper.Generate();
            user.PasswordResetToken = GenerateTokenHelper.Hash(rawToken);
            user.PasswordResetTokenExpiry = DateTimeHelper.UtcNow().AddHours(MailConst.Expiry.PasswordResetTokenHours);

            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            string resetLink =
                $"{clientApp.BaseUrl.TrimEnd('/')}{clientApp.ResetPasswordPath}" +
                $"?token={rawToken}&email={Uri.EscapeDataString(user.Email)}";

            try
            {
                var mailMessage = emailTemplate.CreatePasswordReset(user.Email, user.Username, resetLink);
                await domainEventPublisher.PublishAsync(new SendEmailEvent
                {
                    ToEmail = mailMessage.ToEmail,
                    Subject = mailMessage.Subject,
                    HtmlBody = mailMessage.HtmlBody,
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Publish email đặt lại mật khẩu thất bại cho user {UserId}", user.Id);
            }

            return Result<object>.Ok();
        }
    }
}
