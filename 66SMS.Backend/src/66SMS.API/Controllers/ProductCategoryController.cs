using _66SMS.API.Abstractions;
using _66SMS.Application.Features.ProductCategories.Commands.CreateProductCategories;
using _66SMS.Application.Features.ProductCategories.Commands.DeleteProductCategories;
using _66SMS.Application.Features.ProductCategories.Commands.UpdateProductCategories;
using _66SMS.Application.Features.ProductCategories.Queries.GetAllProductCategories;
using _66SMS.Application.Features.ProductCategories.Queries.GetDetailProductCategory;
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

        public ProductCategoryController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateProductCategoryCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductCategoryCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteProductCategoryCommand { Id = id });
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllProductCategoryQuery query)
        {
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
