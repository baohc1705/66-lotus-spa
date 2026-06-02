using _66SMS.Contracts.Exceptions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.Users.Commands.DeleteUser
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
                    User? user = await userSqlRepository.GetByIdAsync(request.Id.Value);
                    userSqlRepository.Remove(user);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                if (request.Ids != null)
                {
                    List<int> distinctIds = request.Ids.Distinct().ToList();
                    List<User> users = await userSqlRepository.AsQueryable().Where(x => distinctIds.Contains(x.Id)).ToListAsync(cancellationToken);
                    if (users.Count == 0)
                        throw GlobalException.NotFound("User was not found with id");
                    userSqlRepository.RemoveRange(users);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                transaction.Commit();
                return Result<object>.Ok();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw new TransactionRollBackException(nameof(DeleteUserHandler), ex.Message);
            }
        }
    }
}
