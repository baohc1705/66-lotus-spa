using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Services.Commands.CreateServices;
using _66SMS.Application.Features.Services.Commands.DeleteServices;
using _66SMS.Application.Features.Services.Commands.UpdateServices;
using _66SMS.Application.Features.Services.Queries.GetAllServices;
using _66SMS.Application.Features.Services.Queries.GetServices;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ServiceController : ApiController<ServiceController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public ServiceController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllServicesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("users")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllServiceActived(string? name)
        {
            GetAllServicesQuery query = new();
            query.keyword = name != null ? name : null;
            query.IsActived = true;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await mediator.Send(new GetServicesQuery { Id = id });
            return HandleResult(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateServiceCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceCommand command)
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
            var command = new DeleteServiceCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
