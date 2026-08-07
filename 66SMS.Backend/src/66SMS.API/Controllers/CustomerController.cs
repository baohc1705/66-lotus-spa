using _66SMS.API.Abstractions;
using _66SMS.Application.CustomerService.Customers.Commands.CreateCustomer;
using _66SMS.Application.CustomerService.Customers.Commands.DeleteCustomer;
using _66SMS.Application.CustomerService.Customers.Commands.UpdateCustomer;
using _66SMS.Application.CustomerService.Customers.Queries.GetAllCustomer;
using _66SMS.Application.CustomerService.Customers.Queries.GetDetailCustomer;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class CustomerController : ApiController<CustomerController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public CustomerController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("customers", "create")]
        public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("customers", "delete")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var command = new DeleteCustomerCommand { Id = id };
            var userId = jwtService.GetUserId();
            if (userId > 0) command.UpdatedBy = userId;
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("customers", "update")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("customers", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllCustomerQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailCustomerQuery { Id = id });
            return HandleResult(result);
        }
    }
}
