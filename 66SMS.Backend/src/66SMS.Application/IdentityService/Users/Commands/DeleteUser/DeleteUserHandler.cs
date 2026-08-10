using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.IdentityService.Users.Commands.DeleteUser
{
    public class DeleteUserHandler : IRequestHandler<DeleteUserCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteUserHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (request.Id != null)
                {
                    if (request.UpdatedBy != null && request.Id == request.UpdatedBy)
                        return Result<object>.BadRequest(UserConst.MSG_USER_CANNOT_DELETE_SELF, ErrorCodes.ERR_BAD_REQUEST);

                    User? user = await userSqlRepository.FindByIdAsync(request.Id.Value, false, cancellationToken);
                    if (user is null)
                        return Result<object>.NotFound(UserConst.MSG_USER_ID_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

                    if (user.Status == UserConst.STATUS_DELETED)
                        return Result<object>.NotFound(UserConst.MSG_USER_ID_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

                    user.Status = UserConst.STATUS_DELETED;
                    user.UpdatedAt = DateTimeHelper.UtcNow();
                    user.UpdatedBy = request.UpdatedBy;
                    userSqlRepository.Update(user);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                if (request.Ids != null)
                {
                    List<int> distinctIds = request.Ids.Distinct().ToList();
                    if (request.UpdatedBy != null)
                        distinctIds = distinctIds.Where(id => id != request.UpdatedBy).ToList();

                    if (distinctIds.Count == 0)
                        return Result<object>.BadRequest(UserConst.MSG_USER_CANNOT_DELETE_SELF, ErrorCodes.ERR_BAD_REQUEST);

                    List<User> users = await userSqlRepository
                        .AsQueryable(false)
                        .Where(x => distinctIds.Contains(x.Id) && x.Status != UserConst.STATUS_DELETED)
                        .ToListAsync(cancellationToken);
                    if (users.Count == 0)
                        return Result<object>.NotFound(UserConst.MSG_USER_ID_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

                    for (int index = 0; index < users.Count; index++)
                    {
                        var user = users[index];
                        user.Status = UserConst.STATUS_DELETED;
                        user.UpdatedAt = DateTimeHelper.UtcNow();
                        user.UpdatedBy = request.UpdatedBy;
                        userSqlRepository.Update(user);
                    }

                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                transaction.Commit();

                return Result<object>.Ok();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
