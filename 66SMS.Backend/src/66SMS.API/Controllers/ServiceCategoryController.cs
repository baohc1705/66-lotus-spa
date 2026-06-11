using _66SMS.API.Abstractions;
using _66SMS.Application.Features.ServiceCategories.Commands.CreateServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Commands.DeleteServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Commands.UpdateServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Queries.GetAllServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Queries.GetServiceCategories;
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

        public ServiceCategoryController(IMediator mediator)
        {
            this.mediator = mediator;
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
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceCategoriesCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteServiceCategoriesCommand { Id = id });
            return HandleResult(result);
        }
    }
}
