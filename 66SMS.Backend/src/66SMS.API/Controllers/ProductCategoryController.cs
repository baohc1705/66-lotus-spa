using _66SMS.API.Abstractions;
using _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories;
using _66SMS.Application.CatalogService.ProductCategories.Commands.DeleteProductCategoryMultiples;
using _66SMS.Application.CatalogService.ProductCategories.Commands.DeleteProductCategories;
using _66SMS.Application.CatalogService.ProductCategories.Commands.UpdateProductCategories;
using _66SMS.Application.CatalogService.ProductCategories.Queries.GetAllProductCategories;
using _66SMS.Application.CatalogService.ProductCategories.Queries.GetDetailProductCategory;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ProductCategoryController : ApiController<ProductCategoryController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public ProductCategoryController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("products", "create")]
        public async Task<IActionResult> Create([FromBody] CreateProductCategoryCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("products", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductCategoryCommand command)
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
            var command = new DeleteProductCategoryCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("bulk")]
        [PermissionAuthorize("products", "delete")]
        public async Task<IActionResult> DeleteMultiples(
            [FromBody] DeleteProductCategoryMultiplesCommand command)
        {
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllProductCategoryQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("deleted")]
        [PermissionAuthorize("products","read")]
        public async Task<IActionResult> GetAllDeleted([FromQuery] GetAllProductCategoryQuery query)
        {
            query.IsDeleted = true;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailProductCategoryQuery { Id = id });
            return HandleResult(result);
        }
    }
}
