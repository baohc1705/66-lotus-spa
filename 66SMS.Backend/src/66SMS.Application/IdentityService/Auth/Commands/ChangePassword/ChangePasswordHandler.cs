using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.IdentityService.Auth.Commands.ChangePassword
{
    public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IPasswordHash passwordHash;
        public ChangePasswordHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IPasswordHash passwordHash)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.passwordHash = passwordHash;
        }
        public async Task<Result<object>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            User? user = await userSqlRepository.FindByIdAsync((int)request.Id!, asNoTracking: false, cancellationToken: cancellationToken);
            if (user == null)
                return Result<object>.NotFound(UserConst.MSG_USER_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

            if (!passwordHash.Verify(user.PasswordHash, request.CurrentPassword!))
                return Result<object>.BadRequest(UserConst.MSG_USER_WRONG_PASSWORD, ErrorCodes.ERR_USER_INVALID_PASSWORD);

            user.PasswordHash = passwordHash.Hash(request.NewPassword!);
            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
