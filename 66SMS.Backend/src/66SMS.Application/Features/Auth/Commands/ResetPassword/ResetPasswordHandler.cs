using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Exceptions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.ResetPassword
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
            User? user = await userSqlRepository.Query(asNoTracking: false).Where(x => x.Email.Equals(request.Email)).FirstOrDefaultAsync(cancellationToken) ?? throw GlobalException.NotFound("User not found");

            // Kiem tra token
            if (user.PasswordResetToken != request.Token || user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry.IsExpired())
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
