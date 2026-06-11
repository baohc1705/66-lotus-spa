using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Services.Commands.CreateServices
{
    public class CreateServiceHandler : IRequestHandler<CreateServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IServiceProductSqlRepository serviceProductSqlRepository;
        private readonly IServiceImageSqlRepository serviceImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateServiceHandler(IServiceSqlRepository serviceSqlRepository,
                                    IServiceProductSqlRepository serviceProductSqlRepository,
                                    ISqlUnitOfWork sqlUnitOfWork,
                                    IMapper mapper,
                                    IServiceImageSqlRepository serviceImageSqlRepository)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.serviceProductSqlRepository = serviceProductSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.serviceImageSqlRepository = serviceImageSqlRepository;
        }

        public async Task<Result<object>> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Service? service = mapper.Map<Service>(request);
                serviceSqlRepository.Add(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                if (request.ServiceImages != null && request.ServiceImages.Any())
                {
                    AddServiceImages(service.Id, request.ServiceImages);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

                if (request.ServiceProducts != null && request.ServiceProducts.Any())
                {
                    AddServiceProducts(service.Id, request.ServiceProducts);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }
                transaction.Commit();
                return Result<object>.Created(service.Id);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw;
            }
        }

        private void AddServiceProducts(int id, List<ServiceProductItems> serviceProductsRequest)
        {
            List<ServiceProduct> serviceProducts = serviceProductsRequest.Select(x =>
            {
                ServiceProduct serviceProduct = mapper.Map<ServiceProduct>(x);
                serviceProduct.ServiceId = id;
                serviceProduct.CreatedAt = DateTimeHelper.UtcNow();
                return serviceProduct;
            }).ToList();
            serviceProductSqlRepository.AddRange(serviceProducts);
        }

        private void AddServiceImages(int id, List<ServiceImageItems> serviceImagesRequest)
        {
            List<ServiceImage> serviceImages = serviceImagesRequest.Select(x =>
            {
                ServiceImage serviceImage = mapper.Map<ServiceImage>(x);
                serviceImage.ServiceId = id;
                return serviceImage;
            }).ToList();
            serviceImageSqlRepository.AddRange(serviceImages);
        }
    }
}
