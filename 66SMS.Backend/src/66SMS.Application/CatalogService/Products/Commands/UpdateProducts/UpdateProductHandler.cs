using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CatalogService.Products.Commands.UpdateProducts
{
    /// <summary>
    /// Handler for <see cref="UpdateProductCommand"/>
    /// </summary>
    public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, Result<object>>
    {
        private readonly IProductSqlRepository productSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateProductHandler(
            IProductSqlRepository productSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.productSqlRepository = productSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            Product? product = await productSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            if (product == null)
            {
                return Result<object>.NotFound(ProductConst.MSG_PRODUCT_ID_NOT_FOUND, ErrorCodes.ERR_PRODUCT_NOT_FOUND);
            }

            mapper.Map(request, product);

            productSqlRepository.Update(product);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
