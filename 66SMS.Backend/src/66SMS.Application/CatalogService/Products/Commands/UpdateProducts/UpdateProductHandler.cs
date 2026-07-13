using _66SMS.Contract.Abstractions;
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
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public UpdateProductHandler(
            IProductSqlRepository productSqlRepository,
            IProductImageSqlRepository productImageSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.productSqlRepository = productSqlRepository;
            this.productImageSqlRepository = productImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
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

            if (request.Images != null)
            {
                foreach (var dto in request.Images)
                {
                    if (dto.Id.HasValue && dto.Id.Value > 0)
                    {
                        var existing = await productImageSqlRepository.FindByIdAsync(dto.Id.Value, false, cancellationToken);
                        if (existing == null) continue;

                        if (dto.IsPrimary.HasValue) existing.IsPrimary = dto.IsPrimary.Value;
                        if (dto.SortOrder.HasValue) existing.SortOrder = dto.SortOrder.Value;
                        if (string.IsNullOrWhiteSpace(dto.ImageBase64) && dto.Url != null)
                            existing.Url = dto.Url;

                        if (!string.IsNullOrWhiteSpace(dto.ImageBase64))
                        {
                            var url = await imageUploadService.UploadAsync(
                                dto.ImageBase64,
                                ProductConst.GenerateImageFileName(existing.Id),
                                ProductConst.IMAGE_FOLDER,
                                cancellationToken);

                            if (!string.IsNullOrWhiteSpace(url))
                                existing.Url = url;
                        }

                        productImageSqlRepository.Update(existing);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                    else if (!string.IsNullOrWhiteSpace(dto.ImageBase64) || !string.IsNullOrWhiteSpace(dto.Url))
                    {
                        var image = new ProductImage
                        {
                            ProductId = product.Id,
                            Url = string.IsNullOrWhiteSpace(dto.ImageBase64)
                                ? (dto.Url ?? string.Empty)
                                : string.Empty,
                            IsPrimary = dto.IsPrimary ?? false,
                            SortOrder = dto.SortOrder ?? 0,
                        };
                        productImageSqlRepository.Add(image);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                        if (!string.IsNullOrWhiteSpace(dto.ImageBase64))
                        {
                            image.Url = await imageUploadService.UploadAsync(
                                dto.ImageBase64,
                                ProductConst.GenerateImageFileName(image.Id),
                                ProductConst.IMAGE_FOLDER,
                                cancellationToken) ?? string.Empty;

                            if (!string.IsNullOrWhiteSpace(image.Url))
                            {
                                productImageSqlRepository.Update(image);
                                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                            }
                        }
                    }
                }
            }

            return Result<object>.Ok();
        }
    }
}
