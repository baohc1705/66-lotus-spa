using _66SMS.Application.DTOs.Products;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.Features.Products.Queries.GetAllProducts
{
    public class GetAllProductHandler : IRequestHandler<GetAllProductQuery, Result<PagedResult<ProductDto>>>
    {
        private readonly IProductSqlRepository productSqlRepository;
        private readonly IMapper mapper;

        public GetAllProductHandler(IProductSqlRepository productSqlRepository, IMapper mapper)
        {
            this.productSqlRepository = productSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<ProductDto>>> Handle(GetAllProductQuery request, CancellationToken cancellationToken)
        {
            var query = productSqlRepository.AsQueryable();

            if (request.CategoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == request.CategoryId.Value);
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                var keywordLower = request.Keyword.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower) || x.Code.ToLower().Contains(keywordLower));
            }

            PagedResult<ProductDto> result = await query
                .ProjectTo<ProductDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ProductDto>>.Success(result);
        }
    }
}
