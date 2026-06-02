using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Auth.Commands.ForgotPassword
{
    public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IEmailService emailService;
        private readonly IEmailTemplateFactory emailTemplate;

        public ForgotPasswordHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IEmailService emailService, IEmailTemplateFactory emailTemplate)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.emailService = emailService;
            this.emailTemplate = emailTemplate;
        }

        public async Task<Result<object>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            User user = await userSqlRepository.AsQueryable(false).Where(x => x.Email.Equals(request.Email)).FirstOrDefaultAsync(cancellationToken);
            // Bao mat thong tin tranh bi spam nhap email
            if (user == null)
                return Result<object>.Ok();

            // Tao token
            string rawToken = GenerateTokenHelper.Generate();

            user.PasswordResetToken = rawToken;
            user.PasswordResetTokenExpiry = DateTimeHelper.UtcNow().AddHours(MailConst.Expiry.PasswordResetTokenHours);

            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            string resetLink = $"https://localhost:7777/reset-password?token={rawToken}&email={Uri.EscapeDataString(user.Email)}";
            var mailMessage = emailTemplate.CreatePasswordReset(user.Email, user.Username, resetLink);
            
            await emailService.SendAsync(mailMessage, cancellationToken);

            return Result<object>.Ok();
        }
    }
}
