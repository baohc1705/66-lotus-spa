using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Auth.Commands.VerifyEmailOtp
{
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
            var user = await userSqlRepository.AsQueryable(false)
                .Where(x => x.Email.Equals(request.Email))
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
                return Result<object>.NotFound(OtpVerificationConst.MSG_OTP_EMAIL_NOT_FOUND, ErrorCodes.ERR_OTP_EMAIL_NOT_FOUND);

            if (user.IsEmailConfirmed)
                return Result<object>.Conflict(OtpVerificationConst.MSG_OTP_EMAIL_ALREADY_VERIFIED, ErrorCodes.ERR_OTP_EMAIL_ALREADY_VERIFIED);

            var otp = await otpVerificationSqlRepository.FindLatestByUserIdAsync(user.Id, cancellationToken);

            if (otp == null)
                return Result<object>.BadRequest(OtpVerificationConst.MSG_OTP_NOT_SENT, ErrorCodes.ERR_OTP_NOT_SENT);

            if (!otp.IsValid)
                return Result<object>.BadRequest(OtpVerificationConst.MSG_OTP_INVALID_OR_EXPIRED, ErrorCodes.ERR_OTP_INVALID_OR_EXPIRED);

            if (!otp.OtpCode.Equals(request.OtpCode))
                return Result<object>.BadRequest(OtpVerificationConst.MSG_OTP_WRONG_CODE, ErrorCodes.ERR_OTP_WRONG_CODE);

            otp.IsUsed = true;
            user.IsEmailConfirmed = true;

            otpVerificationSqlRepository.Update(otp);
            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
