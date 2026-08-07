using _66SMS.API.Abstractions;
using _66SMS.Application.CatalogService.Products.Commands.CreateProducts;
using _66SMS.Application.CatalogService.Products.Commands.DeleteProductMultiples;
using _66SMS.Application.CatalogService.Products.Commands.DeleteProducts;
using _66SMS.Application.CatalogService.Products.Commands.UpdateProducts;
using _66SMS.Application.CatalogService.Products.Queries.GetAllProducts;
using _66SMS.Application.CatalogService.Products.Queries.GetDetailProduct;
using _66SMS.Domain.Enums;
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

        public ProductController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [PermissionAuthorize("products", "create")]
        public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("products", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("products", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteProductCommand { Id = id };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("bulk")]
        [PermissionAuthorize("products", "delete")]
        public async Task<IActionResult> DeleteMultiples(
            [FromBody] DeleteProductMultiplesCommand command)
        {
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

        [HttpGet("deleted")]
        [PermissionAuthorize("products", "read")]
        public async Task<IActionResult> AdminGetAllDeleted([FromQuery] GetAllProductQuery query)
        {
            query.IsDeleted = true;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllProductQuery query)
        {
            query.Status = (int)StatusActiveEnum.ACTIVED;
            query.IsDeleted = false;
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
