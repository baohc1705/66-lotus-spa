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

        public UpdateServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateServiceCategoriesCommand request, CancellationToken cancellationToken)
        {
            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
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

                // update and persist to database
                serviceCategorySqlRepository.Update(service);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

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
