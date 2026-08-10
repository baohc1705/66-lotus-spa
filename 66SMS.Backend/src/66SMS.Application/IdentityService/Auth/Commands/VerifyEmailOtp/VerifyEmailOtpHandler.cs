using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Auth.Commands.VerifyEmailOtp
{
    public class VerifyEmailOtpHandler : IRequestHandler<VerifyEmailOtpCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public VerifyEmailOtpHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(VerifyEmailOtpCommand request, CancellationToken cancellationToken)
        {
            var user = await userSqlRepository
                .AsQueryable(false)
                .Where(x => x.Email.Equals(request.Email))
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
                return Result<object>.NotFound(OtpVerificationConst.MSG_OTP_EMAIL_NOT_FOUND, ErrorCodes.ERR_OTP_EMAIL_NOT_FOUND);

            if (user.IsEmailConfirmed)
                return Result<object>.Ok();

            if (user.OtpCode != request.OtpCode)
                return Result<object>.BadRequest(OtpVerificationConst.MSG_OTP_WRONG_CODE, ErrorCodes.ERR_OTP_WRONG_CODE);

            user.IsEmailConfirmed = true;
            user.OtpCode = Random.Shared.Next(100000, 999999).ToString();
            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
