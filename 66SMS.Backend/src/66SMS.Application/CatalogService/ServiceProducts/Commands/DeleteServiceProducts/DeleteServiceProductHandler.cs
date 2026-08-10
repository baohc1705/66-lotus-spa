using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.DeleteServiceProducts
{
    public class DeleteServiceProductHandler : IRequestHandler<DeleteServiceProductCommand, Result<object>>
    {
        private readonly IServiceProductSqlRepository repository;
        private readonly ISqlUnitOfWork unitOfWork;

        public DeleteServiceProductHandler(IServiceProductSqlRepository repository, ISqlUnitOfWork unitOfWork)
        {
            this.repository = repository;
            this.unitOfWork = unitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteServiceProductCommand request, CancellationToken cancellationToken)
        {
            var entity = await repository.FindByIdAsync(request.Id, false, cancellationToken);
            if (entity == null)
            {
                return Result<object>.NotFound("Không tìm thấy sản phẩm đi kèm.");
            }

            repository.Remove(entity);
            await unitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Success(true);
        }
    }
}
