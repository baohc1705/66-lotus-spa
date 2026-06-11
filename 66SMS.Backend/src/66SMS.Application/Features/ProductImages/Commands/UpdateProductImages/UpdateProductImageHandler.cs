using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.ProductImages.Commands.UpdateProductImages
{
    public class UpdateProductImageHandler : IRequestHandler<UpdateProductImageCommand, Result<object>>
    {
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateProductImageHandler(
            IProductImageSqlRepository productImageSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.productImageSqlRepository = productImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateProductImageCommand request, CancellationToken cancellationToken)
        {
            ProductImage productImage = await productImageSqlRepository.FindByIdAsync(request.Id);
            if (productImage == null)
            {
                return Result<object>.NotFound("Product image not found.", ErrorCodes.ERR_PRODUCT_IMAGE_NOT_FOUND);
            }

            mapper.Map(request, productImage);

            productImageSqlRepository.Update(productImage);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
