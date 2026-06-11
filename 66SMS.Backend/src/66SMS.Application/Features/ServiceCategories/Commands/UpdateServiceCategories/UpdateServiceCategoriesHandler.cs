using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.ServiceCategories.Commands.UpdateServiceCategories
{
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
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                ServiceCategory? entity = await serviceCategorySqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
                if (entity == null)
                {
                    return Result<object>.NotFound("Service category not found", ErrorCodes.ERR_SERVICE_CATEGORY_NOT_FOUND);
                }

                mapper.Map(request, entity);
                entity.UpdatedAt = DateTime.UtcNow;

                serviceCategorySqlRepository.Update(entity);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Success(new { entity.Id });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Result<object>.Failure(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
