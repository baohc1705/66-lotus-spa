using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.CreateServiceCategories
{
    public class CreateServiceCategoriesHandler : IRequestHandler<CreateServiceCategoriesCommand, Result<object>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public CreateServiceCategoriesHandler(
            IServiceCategorySqlRepository serviceCategorySqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService,
            ICacheService cacheService)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
            this.cacheService = cacheService;
        }

        public async Task<Result<object>> Handle(CreateServiceCategoriesCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                ServiceCategory? service = mapper.Map<ServiceCategory>(request);

                serviceCategorySqlRepository.Add(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.Icon))
                {
                    service.Icon = await imageUploadService.UploadAsync(request.Icon, ServiceCategoryConst.GenerateIconFileName(service.Id), ServiceCategoryConst.IMAGE_FOLDER, cancellationToken);
                }

                if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    service.ImageUrl = await imageUploadService.UploadAsync(request.ImageUrl, ServiceCategoryConst.GenerateImageFileName(service.Id), ServiceCategoryConst.IMAGE_FOLDER, cancellationToken);
                }

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                await cacheService.RemoveByPrefixAsync(ServiceCategoryConst.CACHE_PREFIX, cancellationToken);
                await cacheService.RemoveByPrefixAsync(ServiceConst.CACHE_PREFIX, cancellationToken);

                return Result<object>.Created(service.Id);
            }
            catch (Exception)
            {
                transaction.Rollback(); throw;
            }
        }
    }
}
