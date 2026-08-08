using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.CatalogService.Services.Commands.CreateServices
{
    /// <summary>
    /// Handler for <see cref="CreateServiceCommand"/>
    /// </summary>
    public class CreateServiceHandler : IRequestHandler<CreateServiceCommand, Result<object>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IProductSqlRepository productSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public CreateServiceHandler(
            IServiceSqlRepository serviceSqlRepository,
            IProductSqlRepository productSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.productSqlRepository = productSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
        {
            Service? service = mapper.Map<Service>(request);
            service.Code = string.Empty;
            service.ImageUrl = string.Empty;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (request.ServiceProducts != null && request.ServiceProducts.Any())
                {
                    var productIds = request.ServiceProducts
                        .Where(x => x.ProductId.HasValue && x.ProductId > 0)
                        .Select(x => x.ProductId!.Value)
                        .Distinct()
                        .ToList();

                    var costByProductId = await productSqlRepository
                        .AsQueryable(true)
                        .Where(p => productIds.Contains(p.Id))
                        .ToDictionaryAsync(p => p.Id, p => p.CostPrice, cancellationToken);

                    service.ServiceProducts = request.ServiceProducts.Select(x =>
                    {
                        var serviceProduct = mapper.Map<ServiceProduct>(x);
                        if (!serviceProduct.UnitCost.HasValue
                            && x.ProductId.HasValue
                            && costByProductId.TryGetValue(x.ProductId.Value, out var costPrice))
                        {
                            serviceProduct.UnitCost = costPrice;
                        }
                        return serviceProduct;
                    }).ToList();
                }

                serviceSqlRepository.Add(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    service.ImageUrl = await imageUploadService.UploadAsync(request.ImageUrl, ServiceConst.GenerateImageFileName(service.Id), ServiceConst.IMAGE_FOLDER, cancellationToken);
                }

                service.Code = $"SER{service.Id:D6}";
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                await cacheService.RemoveAsync(ServiceConst.CacheKeyDetail(service.Id), cancellationToken);
                await cacheService.RemoveByPrefixAsync(ServiceConst.CACHE_PREFIX, cancellationToken);

                return Result<object>.Created(service.Id);
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
