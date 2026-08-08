using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Exceptions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Auth.Commands.ResetPassword
{
    public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IPasswordHash passwordHash;
        public ResetPasswordHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IPasswordHash passwordHash)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.passwordHash = passwordHash;
        }

        public async Task<Result<object>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            string email = request.Email!.Trim().ToLowerInvariant();

            User? user = await userSqlRepository.AsQueryable(asNoTracking: false).Where(x => x.Email.ToLower() == email).FirstOrDefaultAsync(cancellationToken) ?? throw GlobalException.NotFound("User not found");

            
            if (!GenerateTokenHelper.Verify(request.Token!, user.PasswordResetToken)
                || user.PasswordResetTokenExpiry == null
                || user.PasswordResetTokenExpiry.Value.IsExpired())
                throw GlobalException.BadRequest("Token invalid");

            // hash pass and delete token
            user.PasswordHash = passwordHash.Hash(request.NewPassword!);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            userSqlRepository.Update(user);

            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
