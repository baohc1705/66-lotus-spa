using _66SMS.API.Abstractions;
using _66SMS.Application.Features.ServiceCategories.Commands.CreateServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Commands.DeleteServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Commands.UpdateServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Queries.GetAllServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Queries.GetServiceCategories;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ServiceCategoryController : ApiController<ServiceCategoryController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public ServiceCategoryController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllServiceCategoriesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await mediator.Send(new GetServiceCategoriesQuery { Id = id });
            return HandleResult(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateServiceCategoriesCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceCategoriesCommand command)
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
            var command = new DeleteServiceCategoriesCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
