using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.ServiceCategories.Commands.CreateServiceCategories
{
    public class CreateServiceCategoriesHandler : IRequestHandler<CreateServiceCategoriesCommand, Result<object>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateServiceCategoriesCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                ServiceCategory entity = mapper.Map<ServiceCategory>(request);
                entity.CreatedAt = DateTime.UtcNow;

                serviceCategorySqlRepository.Add(entity);
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
