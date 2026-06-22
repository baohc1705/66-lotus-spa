using _66SMS.API.Abstractions;
using _66SMS.Application.CatalogService.Products.Commands.CreateProducts;
using _66SMS.Application.CatalogService.Products.Commands.DeleteProducts;
using _66SMS.Application.CatalogService.Products.Commands.UpdateProducts;
using _66SMS.Application.CatalogService.Products.Queries.GetAllProducts;
using _66SMS.Application.CatalogService.Products.Queries.GetDetailProduct;
using _66SMS.Contracts.Abstractions;
using _66SMS.Domain.Constants;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ProductController : ApiController<ProductController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public ProductController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("products", "create")]
        public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("products", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("products", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteProductCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("products", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllProductQuery query)
        {
            
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(int? categoryId, string? keyword, decimal? minPrice, decimal? maxPrice, string? orderBy, bool? isDescending, int? pageIndex, int? pageSize)
        {
            GetAllProductQuery query = new()
            {
                CategoryId = categoryId,
                Keyword = keyword,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                Status = ProductConst.STATUS_ACTIVED,
                OrderBy = orderBy,
                IsDescending = isDescending ?? false,
                PageIndex = pageIndex ?? 1,
                PageSize = pageSize ?? 10
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailProductQuery { Id = id });
            return HandleResult(result);
        }
    }
}
