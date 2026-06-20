using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.CustomerService.Customers.Commands.DeleteCustomer
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
            Customer? customer = await customerSqlRepository.FindByIdAsync((int)request.Id, false);
            if (customer == null)
                return Result<object>.NotFound();
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                customer.Status = CustomerConst.STATUS_DELETED;
                customer.UpdatedAt = DateTime.UtcNow;
                customer.UpdatedBy = request.UpdatedBy;
                customerSqlRepository.Update(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                //User? user = await userSqlRepository.FindByIdAsync(customer.UserId, false);
                //if (user != null)
                //{
                //    user.Status = UserConst.STATUS_DELETED;
                //    user.UpdatedAt = DateTime.UtcNow;
                //    user.UpdatedBy = request.UpdatedBy;
                //    userSqlRepository.Update(user);
                //    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                //}

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
