using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Customers.Commands.DeleteCustomer
{
    public class DeleteCustomerHandler : IRequestHandler<DeleteCustomerCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        public DeleteCustomerHandler(IUserSqlRepository userSqlRepository, IUserRoleSqlRepository userRoleSqlRepository, ICustomerSqlRepository customerSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.userSqlRepository = userSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
        {
            Customer? customer = await customerSqlRepository.GetByIdAsync((int)request.Id, false);
            if (customer == null)
                return Result<object>.NotFound();
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                customerSqlRepository.SoftRemove(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                User? user = await userSqlRepository.GetByIdAsync(customer.UserId, false);
                userSqlRepository.SoftRemove(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                UserRole? userRole = await userRoleSqlRepository.Query()
                    .Where(x => x.UserId == user.Id)
                    .FirstOrDefaultAsync(cancellationToken);
                userRoleSqlRepository.SoftRemove(userRole);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
