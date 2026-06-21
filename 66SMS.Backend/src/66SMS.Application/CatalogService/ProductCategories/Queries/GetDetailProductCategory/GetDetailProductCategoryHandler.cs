using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.ProductCategories.Queries.GetDetailProductCategory
{
    /// <summary>
    /// Handler for <see cref="GetDetailProductCategoryQuery"/>
    /// </summary>
    public class GetDetailProductCategoryHandler : IRequestHandler<GetDetailProductCategoryQuery, Result<ProductCategoryDto>>
    {
        private readonly IProductCategorySqlRepository productCategorySqlRepository;
        private readonly IMapper mapper;

        public GetDetailProductCategoryHandler(IProductCategorySqlRepository productCategorySqlRepository, IMapper mapper)
        {
            this.productCategorySqlRepository = productCategorySqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<ProductCategoryDto>> Handle(GetDetailProductCategoryQuery request, CancellationToken cancellationToken)
        {
            // Find category with id
            ProductCategoryDto? productCategoryDto = await productCategorySqlRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new ProductCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToVietnamTimeString("HH:mm dd/MM/yyyy"),
                    UpdatedAt = x.UpdatedAt.ToVietnamTimeString("HH:mm dd/MM/yyyy")
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (productCategoryDto == null)
            {
                return Result<ProductCategoryDto>.NotFound(ProductCategoryConst.MSG_PRODUCT_CATEGORY_NOT_FOUND, ErrorCodes.ERR_PRODUCT_CATEGORY_NOT_FOUND);
            }

            return Result<ProductCategoryDto>.Success(productCategoryDto);
        }
    }
}
