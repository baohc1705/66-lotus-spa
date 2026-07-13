using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategories
{
    /// <summary>
    /// Handler for <see cref="DeleteServiceCategoriesCommand"/>
    /// </summary>
    public class DeleteServiceCategoriesHandler : IRequestHandler<DeleteServiceCategoriesCommand, Result<object>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteServiceCategoriesCommand request, CancellationToken cancellationToken)
        {
            // Find service by id
            ServiceCategory? entity = await serviceCategorySqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            // Return not found if service is null
            if (entity == null)
            {
                return Result<object>.NotFound(ServiceCategoryConst.MSG_SERVICE_CATEGORY_NOT_FOUND, ErrorCodes.ERR_SERVICE_CATEGORY_NOT_FOUND);
            }

            // Update status is deleted
            entity.Status = (int)StatusActiveEnum.DELETED;
            
            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Update and persist to database
                serviceCategorySqlRepository.Update(entity);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Commit transaction
                transaction.Commit();

                // return success result
                return Result<object>.Ok();
            }
            catch (Exception)
            {
                // Rollback on failure
                transaction.Rollback();
                throw;
            }
        }
    }
}
