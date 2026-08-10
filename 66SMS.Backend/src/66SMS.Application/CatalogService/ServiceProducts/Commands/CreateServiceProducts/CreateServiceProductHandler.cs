using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.CreateServiceProducts
{
    public class CreateServiceProductHandler : IRequestHandler<CreateServiceProductCommand, Result<int>>
    {
        private readonly IServiceProductSqlRepository repository;
        private readonly IProductSqlRepository productSqlRepository;
        private readonly ISqlUnitOfWork unitOfWork;

        public CreateServiceProductHandler(
            IServiceProductSqlRepository repository,
            IProductSqlRepository productSqlRepository,
            ISqlUnitOfWork unitOfWork)
        {
            this.repository = repository;
            this.productSqlRepository = productSqlRepository;
            this.unitOfWork = unitOfWork;
        }

        public async Task<Result<int>> Handle(CreateServiceProductCommand request, CancellationToken cancellationToken)
        {
            decimal? unitCost = request.UnitCost;
            if (!unitCost.HasValue)
            {
                var product = await productSqlRepository.FindByIdAsync(request.ProductId, true, cancellationToken);
                unitCost = product?.CostPrice;
            }

            var entity = new ServiceProduct
            {
                ServiceId = request.ServiceId,
                ProductId = request.ProductId,
                QuantityUsed = request.QuantityUsed,
                UnitCost = unitCost,
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
