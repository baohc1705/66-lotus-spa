using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.ServiceImages.Commands.CreateServiceImages
{
    public class CreateServiceImagesHandler : IRequestHandler<CreateServiceImagesCommand, Result<object>>
    {
        private readonly IServiceImageSqlRepository serviceImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateServiceImagesHandler(IServiceImageSqlRepository serviceImageSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.serviceImageSqlRepository = serviceImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateServiceImagesCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                ServiceImage entity = mapper.Map<ServiceImage>(request);

                serviceImageSqlRepository.Add(entity);
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
