using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;
using _66SMS.Contract.Abstractions;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.CreateServiceCategories
{
    /// <summary>
    /// Handler for <see cref="CreateServiceCategoriesCommand"/>
    /// </summary>
    public class CreateServiceCategoriesHandler : IRequestHandler<CreateServiceCategoriesCommand, Result<object>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public CreateServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper, IImageUploadService imageUploadService)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(CreateServiceCategoriesCommand request, CancellationToken cancellationToken)
        {
            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Map request to domain entity
                ServiceCategory? service = mapper.Map<ServiceCategory>(request);
                service.Icon = string.Empty;

                // Create and persist to database
                serviceCategorySqlRepository.Add(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Upload icon if provided
                if (!string.IsNullOrWhiteSpace(request.Icon))
                {
                    service.Icon = await imageUploadService.UploadAsync(request.Icon, ServiceCategoryConst.GenerateImageFileName(service.Id), ServiceCategoryConst.IMAGE_FOLDER, cancellationToken);
                }
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                // Commit transaction
                transaction.Commit();

                // return to created result
                return Result<object>.Created(service.Id);
            }
            catch (Exception)
            {
                transaction.Rollback(); throw;
            }
        }
    }
}
