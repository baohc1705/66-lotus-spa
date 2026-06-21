using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

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

        public CreateServiceCategoriesHandler(IServiceCategorySqlRepository serviceCategorySqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateServiceCategoriesCommand request, CancellationToken cancellationToken)
        {
            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Map request to domain entity
                ServiceCategory? service = mapper.Map<ServiceCategory>(request);

                // Create and persist to database
                serviceCategorySqlRepository.Add(service);
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
