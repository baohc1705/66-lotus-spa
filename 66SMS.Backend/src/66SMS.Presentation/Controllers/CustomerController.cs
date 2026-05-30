using _66SMS.Application.Features.Customers.Commands.CreateCustomer;
using _66SMS.Application.Features.Customers.Commands.DeleteCustomer;
using _66SMS.Application.Features.Customers.Commands.UpdateCustomer;
using _66SMS.Application.Features.Customers.Queries.GetAllCustomer;
using _66SMS.Application.Features.Customers.Queries.GetDetailCustomer;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using _66SMS.Presentation.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.Presentation.Controllers
{
    [ApiVersion("1.0")]
    public class CustomerController : ApiController<CustomerController>
    {
        private readonly IMediator mediator;

        public CustomerController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("customers", "delete", Roles = "admin")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            Result<object> result = await mediator.Send(new DeleteCustomerCommand { Id = id });
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("customers", "update")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("customers", "read", Roles = "admin")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllCustomerQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("customers", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailCustomerQuery { Id = id});
            return HandleResult(result);
        }
    }
}
