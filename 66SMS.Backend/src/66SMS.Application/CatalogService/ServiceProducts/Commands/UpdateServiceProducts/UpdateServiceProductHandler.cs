using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.UpdateServiceProducts
{
    public class UpdateServiceProductHandler : IRequestHandler<UpdateServiceProductCommand, Result<object>>
    {
        private readonly IServiceProductSqlRepository repository;
        private readonly IProductSqlRepository productSqlRepository;
        private readonly ISqlUnitOfWork unitOfWork;
        private readonly IMapper mapper;

        public UpdateServiceProductHandler(
            IServiceProductSqlRepository repository,
            IProductSqlRepository productSqlRepository,
            ISqlUnitOfWork unitOfWork,
            IMapper mapper)
        {
            this.repository = repository;
            this.productSqlRepository = productSqlRepository;
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateServiceProductCommand request, CancellationToken cancellationToken)
        {
            var entity = await repository.FindByIdAsync(request.Id, false, cancellationToken);
            if (entity == null)
            {
                return Result<object>.NotFound("Không tìm thấy sản phẩm đi kèm.");
            }

            mapper.Map(request, entity);

            if (request.ProductId.HasValue && !request.UnitCost.HasValue)
            {
                var product = await productSqlRepository.FindByIdAsync(request.ProductId.Value, true, cancellationToken);
                if (product != null)
                {
                    entity.UnitCost = product.CostPrice;
                }
            }

            repository.Update(entity);
            await unitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Success(true);
        }
    }
}
