using _66SMS.API.Abstractions;
using _66SMS.Application.Features.ServiceImages.Commands.CreateServiceImages;
using _66SMS.Application.Features.ServiceImages.Commands.DeleteServiceImages;
using _66SMS.Application.Features.ServiceImages.Commands.UpdateServiceImages;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ServiceImageController : ApiController<ServiceImageController>
    {
        private readonly IMediator mediator;

        public ServiceImageController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateServiceImagesCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceImagesCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteServiceImagesCommand { Id = id });
            return HandleResult(result);
        }
    }
}
