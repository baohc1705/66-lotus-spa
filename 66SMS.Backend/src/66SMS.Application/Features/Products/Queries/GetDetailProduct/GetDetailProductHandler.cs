using _66SMS.Application.DTOs.Products;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Products.Queries.GetDetailProduct
{
    public class GetDetailProductHandler : IRequestHandler<GetDetailProductQuery, Result<ProductDto>>
    {
        private readonly IProductSqlRepository productSqlRepository;
        private readonly IMapper mapper;

        public GetDetailProductHandler(IProductSqlRepository productSqlRepository, IMapper mapper)
        {
            this.productSqlRepository = productSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<ProductDto>> Handle(GetDetailProductQuery request, CancellationToken cancellationToken)
        {
            ProductDto? productDto = await productSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<ProductDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (productDto == null)
            {
                return Result<ProductDto>.NotFound("Product not found.", ErrorCodes.ERR_PRODUCT_NOT_FOUND);
            }

            return Result<ProductDto>.Success(productDto);
        }
    }
}
