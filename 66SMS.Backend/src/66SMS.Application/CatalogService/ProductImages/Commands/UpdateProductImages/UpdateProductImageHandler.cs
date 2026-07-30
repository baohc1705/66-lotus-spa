using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductImages.Commands.UpdateProductImages
{
    public class UpdateProductImageHandler : IRequestHandler<UpdateProductImageCommand, Result<object>>
    {
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public UpdateProductImageHandler(
            IProductImageSqlRepository productImageSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.productImageSqlRepository = productImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(UpdateProductImageCommand request, CancellationToken cancellationToken)
        {
            ProductImage? productImage = await productImageSqlRepository.FindByIdAsync(request.Id);
            if (productImage == null)
            {
                return Result<object>.NotFound(ProductImageConst.MSG_PRODUCT_IMAGE_ID_NOT_FOUND, ErrorCodes.ERR_PRODUCT_IMAGE_NOT_FOUND);
            }

            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.Url = null;

            mapper.Map(request, productImage);

            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
            {
                var url = await imageUploadService.UploadAsync(
                    request.ImageBase64,
                    ProductConst.GenerateImageFileName(productImage.Id),
                    ProductConst.IMAGE_FOLDER,
                    cancellationToken);

                if (!string.IsNullOrWhiteSpace(url))
                    productImage.Url = url;
            }

            productImageSqlRepository.Update(productImage);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
