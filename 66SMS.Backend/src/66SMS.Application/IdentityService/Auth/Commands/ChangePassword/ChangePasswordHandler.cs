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
    /// <summary>
    /// Handler for <see cref="ChangePasswordCommand"/>
    /// </summary>
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
            // Find user with id and tracking
            User? user = await userSqlRepository.FindByIdAsync((int)request.Id!, asNoTracking: false, cancellationToken: cancellationToken);

            // Verify password
            bool verifyCurrentPass = passwordHash.Verify(user!.PasswordHash, request.CurrentPassword!);

            // Return bad request if verify password fail
            if (!verifyCurrentPass)
                return Result<object>.BadRequest(UserConst.MSG_USER_WRONG_PASSWORD, ErrorCodes.ERR_USER_INVALID_PASSWORD);

            // Hash new pass for user
            user.PasswordHash = passwordHash.Hash(request.NewPassword!);

            // Tracking update state
            userSqlRepository.Update(user);

            // Persist to database
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            // Return success result
            return Result<object>.Ok();
        }
    }
}
