using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Auth.Commands.VerifyEmailOtp
{
    /// <summary>
    /// Handler for <see cref="VerifyEmailOtpCommand"/>
    /// </summary>
    public class VerifyEmailOtpHandler : IRequestHandler<VerifyEmailOtpCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IOtpVerificationSqlRepository otpVerificationSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public VerifyEmailOtpHandler(
            IUserSqlRepository userSqlRepository,
            IOtpVerificationSqlRepository otpVerificationSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.userSqlRepository = userSqlRepository;
            this.otpVerificationSqlRepository = otpVerificationSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(VerifyEmailOtpCommand request, CancellationToken cancellationToken)
        {
            // Find user with email and tracking
            var user = await userSqlRepository
                .AsQueryable(false)
                .Where(x => x.Email.Equals(request.Email))
                .FirstOrDefaultAsync(cancellationToken);

            // Return not found
            if (user == null)
                return Result<object>.NotFound(OtpVerificationConst.MSG_OTP_EMAIL_NOT_FOUND, ErrorCodes.ERR_OTP_EMAIL_NOT_FOUND);

            // Return if email verified
            if (user.IsEmailConfirmed)
                return Result<object>.Conflict(OtpVerificationConst.MSG_OTP_EMAIL_ALREADY_VERIFIED, ErrorCodes.ERR_OTP_EMAIL_ALREADY_VERIFIED);

            // find otp code with user id in database
            var otp = await otpVerificationSqlRepository
                .AsQueryable(false)
                .Where(x => x.UserId == user.Id)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            // return if otp not found
            if (otp == null)
                return Result<object>.BadRequest(OtpVerificationConst.MSG_OTP_NOT_SENT, ErrorCodes.ERR_OTP_NOT_SENT);

            // return if otp expired
            if (!otp.IsValid)
                return Result<object>.BadRequest(OtpVerificationConst.MSG_OTP_INVALID_OR_EXPIRED, ErrorCodes.ERR_OTP_INVALID_OR_EXPIRED);

            // return if otp request not equals with code in database
            if (!otp.OtpCode.Equals(request.OtpCode))
                return Result<object>.BadRequest(OtpVerificationConst.MSG_OTP_WRONG_CODE, ErrorCodes.ERR_OTP_WRONG_CODE);

            // Set otp is used
            otp.IsUsed = true;
            user.IsEmailConfirmed = true;
            
            // Update and persist to database
            otpVerificationSqlRepository.Update(otp);
            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
