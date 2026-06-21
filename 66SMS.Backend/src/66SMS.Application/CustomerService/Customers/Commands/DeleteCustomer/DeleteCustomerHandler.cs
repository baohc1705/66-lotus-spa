using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.CustomerService.Customers.Commands.DeleteCustomer
{
    /// <summary>
    /// Handler for <see cref="DeleteCustomerCommand"/>
    /// </summary>
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
            // Find customer by id and tracking
            Customer? customer = await customerSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            // return not found if customer is null
            if (customer == null)
                return Result<object>.NotFound(CustomerConst.MSG_CUSTOMER_ID_NOT_FOUND, ErrorCodes.ERR_CUSTOMER_NOT_FOUND);

            // begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // update status is deleted
                customer.Status = CustomerConst.STATUS_DELETED;
                customer.UpdatedAt = DateTime.UtcNow;
                customer.UpdatedBy = request.UpdatedBy;

                // update and persist to database
                customerSqlRepository.Update(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                // return result success
                return Result<object>.Ok();
            }
            catch
            {
                // rollback on failure
                transaction.Rollback();
                throw;
            }
        }
    }
}
