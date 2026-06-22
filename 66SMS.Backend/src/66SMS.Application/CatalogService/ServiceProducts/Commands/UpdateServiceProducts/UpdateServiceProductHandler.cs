using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.UpdateServiceProducts
{
    public class UpdateServiceProductHandler : IRequestHandler<UpdateServiceProductCommand, Result<object>>
    {
        private readonly IServiceProductSqlRepository repository;
        private readonly ISqlUnitOfWork unitOfWork;

        public UpdateServiceProductHandler(IServiceProductSqlRepository repository, ISqlUnitOfWork unitOfWork)
        {
            this.repository = repository;
            this.unitOfWork = unitOfWork;
        }

        public async Task<Result<object>> Handle(UpdateServiceProductCommand request, CancellationToken cancellationToken)
        {
            var entity = await repository.FindByIdAsync(request.Id, false, cancellationToken);
            if (entity == null)
            {
                return Result<object>.NotFound("Không tìm thấy sản phẩm đi kèm.");
            }

            if (request.ProductId.HasValue) entity.ProductId = request.ProductId.Value;
            if (request.QuantityUsed.HasValue) entity.QuantityUsed = request.QuantityUsed.Value;
            if (request.Note != null) entity.Note = request.Note;
            if (request.Status.HasValue) entity.Status = request.Status.Value;

            entity.UpdatedAt = request.UpdatedAt;
            entity.UpdatedBy = request.UpdatedBy;

            repository.Update(entity);
            await unitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Success(true);
        }
    }
}
