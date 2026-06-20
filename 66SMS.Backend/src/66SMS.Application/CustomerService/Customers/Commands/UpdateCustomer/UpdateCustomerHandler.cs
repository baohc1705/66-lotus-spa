using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CustomerService.Customers.Commands.UpdateCustomer
{
    public class UpdateCustomerHandler : IRequestHandler<UpdateCustomerCommand, Result<object>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        public UpdateCustomerHandler(ICustomerSqlRepository customerSqlRepository, IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Update customer
                Customer? customer = await customerSqlRepository.FindByIdAsync((int)request.Id!, false);
                if (customer == null) return Result<object>.NotFound();
                mapper.Map(request, customer);
                customer.UpdatedAt = DateTime.UtcNow;
                customer.UpdatedBy = request.UpdatedBy;
                customerSqlRepository.Update(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Update user if request not null
                if (request.UserName != null || request.Email != null)
                {
                    User? user = await userSqlRepository.FindByIdAsync((int)customer.UserId!, false);
                    mapper.Map(request, user);
                    user!.UpdatedAt = DateTime.UtcNow;
                    user.UpdatedBy = request.UpdatedBy;
                    userSqlRepository.Update(user);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }
                transaction.Commit();
                return Result<object>.Created(customer.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }

        }
    }
}
