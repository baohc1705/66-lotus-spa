using _66SMS.API.Abstractions;
using _66SMS.Application.Features.ProductCategories.Commands.CreateProductCategories;
using _66SMS.Application.Features.ProductCategories.Commands.DeleteProductCategories;
using _66SMS.Application.Features.ProductCategories.Commands.UpdateProductCategories;
using _66SMS.Application.Features.ProductCategories.Queries.GetAllProductCategories;
using _66SMS.Application.Features.ProductCategories.Queries.GetDetailProductCategory;
using _66SMS.Contracts.Abstractions;
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
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateProductCategoryCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductCategoryCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteProductCategoryCommand { Id = id };
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

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailProductCategoryQuery { Id = id });
            return HandleResult(result);
        }
    }
}
