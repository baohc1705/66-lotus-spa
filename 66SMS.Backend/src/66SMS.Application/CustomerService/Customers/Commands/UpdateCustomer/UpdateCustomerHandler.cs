using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CustomerService.Customers.Commands.UpdateCustomer
{
    public class UpdateCustomerHandler : IRequestHandler<UpdateCustomerCommand, Result<object>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        public UpdateCustomerHandler(ICustomerSqlRepository customerSqlRepository,ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
        {
            // begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Find customer by id and tracking
                Customer? customer = await customerSqlRepository.FindByIdAsync((int)request.Id!, false);
                
                if (customer == null) 
                    return Result<object>.NotFound(CustomerConst.MSG_CUSTOMER_NOT_FOUND, Contracts.Enumerations.ErrorCodes.ERR_CUSTOMER_NOT_FOUND);

                // Map request to domain entity
                mapper.Map(request, customer);

                // update and persist to database
                customerSqlRepository.Update(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                
                // commit transaction
                transaction.Commit();

                // return success result
                return Result<object>.Ok();
            }
            catch
            {
                // rollback transaction
                transaction.Rollback();
                throw;
            }

        }
    }
}
