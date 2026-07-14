using _66SMS.Contract.Abstractions;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
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
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public CreateServiceHandler(
            IServiceSqlRepository serviceSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
        {
            // Map request to domain entity
            Service? service = mapper.Map<Service>(request);
            service.Code = string.Empty;
            service.ImageUrl = string.Empty;

            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // // Set image for service if request provived
                // if (request.ServiceImages != null && request.ServiceImages.Any())
                // {
                //     service.Images = request.ServiceImages.Select(x =>
                //     {
                //         var image = mapper.Map<ServiceImage>(x);
                //         return image;
                //     }).ToList();
                // }

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

                // Upload image for service if request provived
                if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    service.ImageUrl = await imageUploadService.UploadAsync(request.ImageUrl, ServiceConst.GenerateImageFileName(service.Id), ServiceConst.IMAGE_FOLDER, cancellationToken);
                }

                // Generate code for service
                service.Code = $"SER{service.Id:D6}";
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                await cacheService.RemoveAsync(ServiceConst.CacheKeyDetail(service.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(ServiceConst.CACHE_PREFIX, cancellationToken);

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
    }
}
