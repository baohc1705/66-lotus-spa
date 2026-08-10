using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.CustomerService.Customers.Commands.DeleteCustomer
{
    public class DeleteCustomerHandler : IRequestHandler<DeleteCustomerCommand, Result<object>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        public DeleteCustomerHandler(ICustomerSqlRepository customerSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
        {
            Customer? customer = await customerSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            if (customer == null)
                return Result<object>.NotFound(CustomerConst.MSG_CUSTOMER_ID_NOT_FOUND, ErrorCodes.ERR_CUSTOMER_NOT_FOUND);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                customer.Status = CustomerConst.STATUS_DELETED;
                customer.UpdatedAt = DateTimeHelper.UtcNow();

                customerSqlRepository.Update(customer);
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
