using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.Features.ProductImages.Queries.GetAllProductImages
{
    public class GetAllProductImageHandler : IRequestHandler<GetAllProductImageQuery, Result<PagedResult<ProductImageDto>>>
    {
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly IMapper mapper;

        public GetAllProductImageHandler(IProductImageSqlRepository productImageSqlRepository, IMapper mapper)
        {
            this.productImageSqlRepository = productImageSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<ProductImageDto>>> Handle(GetAllProductImageQuery request, CancellationToken cancellationToken)
        {
            var query = productImageSqlRepository.AsQueryable();

            if (request.ProductId.HasValue)
            {
                query = query.Where(x => x.ProductId == request.ProductId.Value);
            }

            PagedResult<ProductImageDto> result = await query
                .ProjectTo<ProductImageDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<ProductImageDto>>.Success(result);
        }
    }
}
