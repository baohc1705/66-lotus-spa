using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CustomerService.Customers.Commands.CreateCustomer
{
    /// <summary>
    /// Handler for <see cref="CreateCustomerCommand"/>
    /// </summary>
    public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, Result<object>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateCustomerHandler(ICustomerSqlRepository customerSqlRepository,ISqlUnitOfWork sqlUnitOfWork,IMapper mapper)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
        {
            // Map request to domain entity
            Customer? customer = mapper.Map<Customer>(request);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Auto-create wallet for customer
                customer.Wallet = new Wallet
                {
                    CustomerId = customer.Id,
                    Balance = 0,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = request.CreatedBy ?? 1
                };

                // add and persist to database
                customerSqlRepository.Add(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                // return created result
                return Result<object>.Created(customer.Id);
            }
            catch
            {
                // rollback transaction on failure
                transaction.Rollback();
                throw;
            }
        }
    }
}
