using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Messages;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.IdentityService.Auth.Commands.SendEmailOtp
{
    /// <summary>
    /// Handler for <see cref="SendEmailOtpCommand"/>
    /// </summary>
    public class SendEmailOtpHandler : IRequestHandler<SendEmailOtpCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IEmailTemplateFactory emailTemplateFactory;
        private readonly IDomainEventPublisher domainEventPublisher;

        public SendEmailOtpHandler(
            IUserSqlRepository userSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IEmailTemplateFactory emailTemplateFactory,
            IDomainEventPublisher domainEventPublisher)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.emailTemplateFactory = emailTemplateFactory;
            this.domainEventPublisher = domainEventPublisher;
        }

        public async Task<Result<object>> Handle(SendEmailOtpCommand request, CancellationToken cancellationToken)
        {
            var user = await userSqlRepository.AsQueryable(false)
                .Where(x => x.Email.Equals(request.Email!.Trim()))
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
                return Result<object>.NotFound(OtpVerificationConst.MSG_OTP_EMAIL_NOT_FOUND, ErrorCodes.ERR_OTP_EMAIL_NOT_FOUND);

            user.OtpCode = Random.Shared.Next(100000, 999999).ToString();
            user.UpdatedAt = DateTime.UtcNow;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                userSqlRepository.Update(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                var otpMail = emailTemplateFactory.CreateOtpEmail(
                    user.Email,
                    user.Username,
                    user.OtpCode,
                    UserConst.OTP_CODE_EXPIRY_MINUTES);

                await domainEventPublisher.PublishAsync(new SendEmailEvent
                {
                    ToEmail = otpMail.ToEmail,
                    Subject = otpMail.Subject,
                    HtmlBody = otpMail.HtmlBody,
                }, cancellationToken);

                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
