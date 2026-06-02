using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.ChangePassword
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
            User? user = await userSqlRepository.GetByIdAsync((int)request.Id, asNoTracking: false, cancellationToken: cancellationToken);
            bool verifyCurrentPass = passwordHash.Verify(user.PasswordHash, request.CurrentPassword);
            if (!verifyCurrentPass)
                return Result<object>.BadRequest("Password Wrong", Contracts.Enumerations.ErrorCodes.ERR_VALIDATION_FAILED);
            user.PasswordHash = passwordHash.Hash(request.NewPassword);
            userSqlRepository.Update(user);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
