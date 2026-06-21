using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.Services.Commands.CreateServices
{
    /// <summary>
    /// Handler for <see cref="CreateServiceCommand"/>
    /// </summary>
    public class CreateServiceHandler : IRequestHandler<CreateServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateServiceHandler(IServiceSqlRepository serviceSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
        {
            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Map request to domain entity
                Service? service = mapper.Map<Service>(request);
                service.Code = request.Code ?? GenerateServiceCode();

                // Set image for service if request provived
                if (request.ServiceImages != null && request.ServiceImages.Any())
                {
                    service.Images = request.ServiceImages.Select(x =>
                    {
                        var image = mapper.Map<ServiceImage>(x);
                        return image;
                    }).ToList();
                }

                // Set product for service if request provived
                if (request.ServiceProducts != null && request.ServiceProducts.Any())
                {
                    service.ServiceProducts = request.ServiceProducts.Select(x =>
                    {
                        var serviceProduct = mapper.Map<ServiceProduct>(x);
                        return serviceProduct;
                    }).ToList();
                }

                // Create and persist to database
                serviceSqlRepository.Add(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                // result success result
                return Result<object>.Created(service.Id);
            }
            catch (Exception)
            {
                // rollback transaction on failure
                transaction.Rollback();
                throw;
            }
        }

        private string GenerateServiceCode()
        {
            string random = Random.Shared.Next(100000, 999999).ToString();
            string dateNowStr = DateTimeHelper.VietnamNowString("HHmmss");
            return $"SER{random}{dateNowStr}";
        }
    }
}
