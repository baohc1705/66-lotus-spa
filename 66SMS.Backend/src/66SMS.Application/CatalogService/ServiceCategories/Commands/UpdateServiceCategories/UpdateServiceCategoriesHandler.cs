using _66SMS.Contract.Abstractions;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.UpdateServiceCategories
{
    /// <summary>
    /// Handler for <see cref="UpdateServiceCategoriesCommand"/>
    /// </summary>
    public class UpdateServiceCategoriesHandler : IRequestHandler<UpdateServiceCategoriesCommand, Result<object>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly ICacheService cacheService;

        public UpdateServiceCategoriesHandler(
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

        public async Task<Result<object>> Handle(UpdateServiceCategoriesCommand request, CancellationToken cancellationToken)
        {
            // find by id and tracking
            ServiceCategory? service = await serviceCategorySqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            // return not found if service is not null
            if (service == null)
            {
                return Result<object>.NotFound(ServiceCategoryConst.MSG_SERVICE_CATEGORY_NOT_FOUND, ErrorCodes.ERR_SERVICE_CATEGORY_NOT_FOUND);
            }

            // map request to domain entity, ignore null
            mapper.Map(request, service);

            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Upload icon if provided
                if (!string.IsNullOrWhiteSpace(request.Icon))
                {
                    service.Icon = await imageUploadService.UploadAsync(request.Icon, ServiceCategoryConst.GenerateIconFileName(service.Id), ServiceCategoryConst.IMAGE_FOLDER, cancellationToken);
                }

                // Upload image if provided
                if (!string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    service.ImageUrl = await imageUploadService.UploadAsync(request.ImageUrl, ServiceCategoryConst.GenerateImageFileName(service.Id), ServiceCategoryConst.IMAGE_FOLDER, cancellationToken);
                }

                // update and persist to database
                serviceCategorySqlRepository.Update(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                await cacheService.RemoveByPrefixAsync(ServiceCategoryConst.CACHE_PREFIX, cancellationToken);
                await cacheService.RemoveByPrefixAsync(ServiceConst.CACHE_PREFIX, cancellationToken);

                // return success result
                return Result<object>.Ok();
            }
            catch (Exception)
            {
                // rollback on failure
                transaction.Rollback(); throw;
            }
        }
    }
}
