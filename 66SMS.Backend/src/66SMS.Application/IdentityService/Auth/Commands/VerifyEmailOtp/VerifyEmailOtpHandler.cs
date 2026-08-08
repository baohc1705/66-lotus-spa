using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
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
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public VerifyEmailOtpHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(VerifyEmailOtpCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra email có tồn tại không
            var user = await userSqlRepository
                .AsQueryable(false)
                .Where(x => x.Email.Equals(request.Email))
                .FirstOrDefaultAsync(cancellationToken);

            // Trả về lỗi nếu email không tồn tại
            if (user == null)
                return Result<object>.NotFound(OtpVerificationConst.MSG_OTP_EMAIL_NOT_FOUND, ErrorCodes.ERR_OTP_EMAIL_NOT_FOUND);

            // Trả về thành công nếu email đã được xác thực, chống spam
            if (user.IsEmailConfirmed)
                return Result<object>.Ok();

            // Trả về lỗi nếu mã OTP không khớp
            if (user.OtpCode != request.OtpCode)
                return Result<object>.BadRequest(OtpVerificationConst.MSG_OTP_WRONG_CODE, ErrorCodes.ERR_OTP_WRONG_CODE);
            
            // Cập nhật email đã được xác thực và tạo mã OTP mới
            user.IsEmailConfirmed = true;
            user.OtpCode = Random.Shared.Next(100000, 999999).ToString();
            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
