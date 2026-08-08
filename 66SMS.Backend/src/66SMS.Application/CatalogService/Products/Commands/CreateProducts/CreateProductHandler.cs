using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.Products.Commands.CreateProducts
{
    /// <summary>
    /// Handler for <see cref="CreateProductCommand"/>
    /// </summary>
    public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<int>>
    {
        private readonly IProductSqlRepository productSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public CreateProductHandler(
            IProductSqlRepository productSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.productSqlRepository = productSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<int>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Product product = mapper.Map<Product>(request);
                product.Code = string.Empty;

                var pendingUploads = new List<(ProductImage Image, string Base64)>();

                if (request.Images.Count > 0)
                {
                    product.Images = new List<ProductImage>();
                    foreach (var dto in request.Images)
                    {
                        var image = new ProductImage
                        {
                            Url = string.IsNullOrWhiteSpace(dto.ImageBase64)
                                ? (dto.Url ?? string.Empty)
                                : string.Empty,
                            IsPrimary = dto.IsPrimary ?? false,
                            SortOrder = dto.SortOrder ?? 0,
                        };
                        product.Images.Add(image);
                        if (!string.IsNullOrWhiteSpace(dto.ImageBase64))
                            pendingUploads.Add((image, dto.ImageBase64!));
                    }
                }

                productSqlRepository.Add(product);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                foreach (var (image, base64) in pendingUploads)
                {
                    var url = await imageUploadService.UploadAsync(
                        base64,
                        ProductConst.GenerateImageFileName(image.Id),
                        ProductConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(url))
                        image.Url = url;
                }

                product.Code = $"PRO{product.Id:D6}";
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Success(product.Id);
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }


    }
}
