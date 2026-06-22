using _66SMS.API.Abstractions;
using _66SMS.Application.CatalogService.ServiceProducts.Commands.CreateServiceProducts;
using _66SMS.Application.CatalogService.ServiceProducts.Commands.DeleteServiceProducts;
using _66SMS.Application.CatalogService.ServiceProducts.Commands.UpdateServiceProducts;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ServiceProductController : ApiController<ServiceProductController>
    {
        private readonly IMediator mediator;

        public ServiceProductController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateServiceProductCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceProductCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteServiceProductCommand { Id = id });
            return HandleResult(result);
        }
    }
}
