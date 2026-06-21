using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.IdentityService.Users.Commands.DeleteUser
{
    /// <summary>
    /// Handler for <see cref="DeleteUserCommand"/>
    /// </summary>
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
                // Update one account
                if (request.Id != null)
                {
                    // Find user with id and tracking
                    User? user = await userSqlRepository.FindByIdAsync(request.Id.Value, false, cancellationToken);
                    if (user is null)
                        return Result<object>.NotFound(UserConst.MSG_USER_ID_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);
                    
                    // Update status is deleted
                    user.Status = UserConst.STATUS_DELETED;
                    userSqlRepository.Update(user);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                // Delete list account
                if (request.Ids != null)
                {
                    // Distinct list ids
                    List<int> distinctIds = request.Ids.Distinct().ToList();

                    // Find list user contains ids and tracking
                    List<User> users = await userSqlRepository
                        .AsQueryable(false)
                        .Where(x => distinctIds.Contains(x.Id))
                        .ToListAsync(cancellationToken);
                    if (users.Count == 0)
                        return Result<object>.NotFound(UserConst.MSG_USER_ID_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

                    // Update each user with status is deleted - soft deleted
                    foreach (var user in users)
                    {
                        user.Status = UserConst.STATUS_DELETED;
                        user.UpdatedAt = DateTime.UtcNow;
                        user.UpdatedBy = request.UpdatedBy;
                        userSqlRepository.Update(user);
                    }
                    
                    // Persist database
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                // Commit transaction
                transaction.Commit();

                // Return ok
                return Result<object>.Ok();
            }
            catch (Exception)
            {
                // Rollback on failure
                transaction.Rollback();
                throw;
            }
        }
    }
}
