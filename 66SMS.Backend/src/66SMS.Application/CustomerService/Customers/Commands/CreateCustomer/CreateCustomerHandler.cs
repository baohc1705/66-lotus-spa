using _66SMS.Contract.Abstractions;
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
        private readonly IImageUploadService imageUploadService;

        public CreateCustomerHandler(
            ICustomerSqlRepository customerSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.AvatarUrl = null;

            Customer? customer = mapper.Map<Customer>(request);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                customer.Wallet = new Wallet
                {
                    CustomerId = customer.Id,
                    Balance = 0,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTime.UtcNow
                };

                customerSqlRepository.Add(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    customer.AvatarUrl = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        CustomerConst.GenerateImageFileName(customer.Id),
                        CustomerConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(customer.AvatarUrl))
                    {
                        customerSqlRepository.Update(customer);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
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
