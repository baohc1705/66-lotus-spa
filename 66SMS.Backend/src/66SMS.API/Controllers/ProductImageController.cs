using _66SMS.API.Abstractions;
using _66SMS.Application.Features.ProductImages.Commands.CreateProductImages;
using _66SMS.Application.Features.ProductImages.Commands.DeleteProductImages;
using _66SMS.Application.Features.ProductImages.Commands.UpdateProductImages;
using _66SMS.Application.Features.ProductImages.Queries.GetAllProductImages;
using _66SMS.Application.Features.ProductImages.Queries.GetDetailProductImage;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ProductImageController : ApiController<ProductImageController>
    {
        private readonly IMediator mediator;

        public ProductImageController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateProductImageCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductImageCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteProductImageCommand { Id = id });
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllProductImageQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailProductImageQuery { Id = id });
            return HandleResult(result);
        }
    }
}
