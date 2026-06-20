using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.ProductImages.Queries.GetDetailProductImage
{
    public class GetDetailProductImageHandler : IRequestHandler<GetDetailProductImageQuery, Result<ProductImageDto>>
    {
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly IMapper mapper;

        public GetDetailProductImageHandler(IProductImageSqlRepository productImageSqlRepository, IMapper mapper)
        {
            this.productImageSqlRepository = productImageSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<ProductImageDto>> Handle(GetDetailProductImageQuery request, CancellationToken cancellationToken)
        {
            ProductImageDto? productImageDto = await productImageSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<ProductImageDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (productImageDto == null)
            {
                return Result<ProductImageDto>.NotFound(ProductImageConst.MSG_PRODUCT_IMAGE_NOT_FOUND, ErrorCodes.ERR_PRODUCT_IMAGE_NOT_FOUND);
            }

            return Result<ProductImageDto>.Success(productImageDto);
        }
    }
}
