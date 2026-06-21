using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace _66SMS.Application.IdentityService.Auth.Commands.SendEmailOtp
{
    /// <summary>
    /// Handler for <see cref="SendEmailOtpCommand"/>
    /// </summary>
    public class SendEmailOtpHandler : IRequestHandler<SendEmailOtpCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IOtpVerificationSqlRepository otpVerificationSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IEmailService emailService;
        private readonly IEmailTemplateFactory emailTemplateFactory;
        private readonly OtpSettings otpSettings;

        public SendEmailOtpHandler(
            IUserSqlRepository userSqlRepository,
            IOtpVerificationSqlRepository otpVerificationSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IEmailService emailService,
            IEmailTemplateFactory emailTemplateFactory,
            IOptions<OtpSettings> otpSettings)
        {
            this.userSqlRepository = userSqlRepository;
            this.otpVerificationSqlRepository = otpVerificationSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.emailService = emailService;
            this.emailTemplateFactory = emailTemplateFactory;
            this.otpSettings = otpSettings.Value;
        }

        public async Task<Result<object>> Handle(SendEmailOtpCommand request, CancellationToken cancellationToken)
        {
            // find user with email
            var user = await userSqlRepository.AsQueryable(false)
                .Where(x => x.Email.Equals(request.Email!.Trim()))
                .FirstOrDefaultAsync(cancellationToken);

            // If user null return not found
            if (user == null)
                return Result<object>.NotFound(OtpVerificationConst.MSG_OTP_EMAIL_NOT_FOUND, ErrorCodes.ERR_OTP_EMAIL_NOT_FOUND);

            // If email user confirmed return email already verified
            if (user.IsEmailConfirmed)
                return Result<object>.Conflict(OtpVerificationConst.MSG_OTP_EMAIL_ALREADY_VERIFIED, ErrorCodes.ERR_OTP_EMAIL_ALREADY_VERIFIED);

            // Random otp 6 number
            var otpCode = Random.Shared.Next(100000, 999999).ToString();

            // Create object 
            var otp = new OtpVerification
            {
                UserId = user.Id,
                OtpCode = otpCode,
                ExpiresAt = DateTimeHelper.UtcNow().AddMinutes(otpSettings.ExpiryMinutes),
                IsUsed = false,
                CreatedAt = DateTimeHelper.UtcNow(),
            };

            // Save and persist to database
            otpVerificationSqlRepository.Add(otp);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            try 
            {
                // Send mail with otp to email
                var mailMessage = emailTemplateFactory.CreateOtpEmail(user.Email, user.Username, otpCode, otpSettings.ExpiryMinutes);
                await emailService.SendAsync(mailMessage, cancellationToken);
            }
            catch
            {
                return Result<object>.ServerError();
            }

            return Result<object>.Ok();
        }
    }
}
