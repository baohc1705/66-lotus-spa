using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductImages.Commands.CreateProductImages
{
    public class CreateProductImageHandler : IRequestHandler<CreateProductImageCommand, Result<int>>
    {
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public CreateProductImageHandler(
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

        public async Task<Result<int>> Handle(CreateProductImageCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.Url = string.Empty;

            ProductImage productImage = mapper.Map<ProductImage>(request);
            productImage.Url ??= string.Empty;

            productImageSqlRepository.Add(productImage);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
            {
                productImage.Url = await imageUploadService.UploadAsync(
                    request.ImageBase64,
                    ProductConst.GenerateImageFileName(productImage.Id),
                    ProductConst.IMAGE_FOLDER,
                    cancellationToken) ?? string.Empty;

                if (!string.IsNullOrWhiteSpace(productImage.Url))
                {
                    productImageSqlRepository.Update(productImage);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }
            }

            return Result<int>.Success(productImage.Id);
        }
    }
}
