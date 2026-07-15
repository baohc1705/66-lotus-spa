using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.CreateServiceProducts
{
    public class CreateServiceProductHandler : IRequestHandler<CreateServiceProductCommand, Result<int>>
    {
        private readonly IServiceProductSqlRepository repository;
        private readonly ISqlUnitOfWork unitOfWork;

        public CreateServiceProductHandler(IServiceProductSqlRepository repository, ISqlUnitOfWork unitOfWork)
        {
            this.repository = repository;
            this.unitOfWork = unitOfWork;
        }

        public async Task<Result<int>> Handle(CreateServiceProductCommand request, CancellationToken cancellationToken)
        {
            var entity = new ServiceProduct
            {
                ServiceId = request.ServiceId,
                ProductId = request.ProductId,
                QuantityUsed = request.QuantityUsed,
                Note = request.Note,
                Status = request.Status,
                CreatedAt = request.CreatedAt ?? DateTimeHelper.UtcNow(),
            };

            repository.Add(entity);
            await unitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Created(entity.Id);
        }
    }
}
