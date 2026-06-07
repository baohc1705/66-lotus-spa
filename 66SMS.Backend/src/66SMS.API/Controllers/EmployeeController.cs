using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Employees.Commands.CreateEmployee;
using _66SMS.Application.Features.Employees.Commands.DeleteEmployee;
using _66SMS.Application.Features.Employees.Commands.UpdateEmployee;
using _66SMS.Application.Features.Employees.Queries.GetAllEmployee;
using _66SMS.Application.Features.Employees.Queries.GetDetailEmployee;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Mvc;

using Asp.Versioning;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class EmployeeController : ApiController<EmployeeController>
    {
        private readonly IMediator mediator;

        public EmployeeController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [PermissionAuthorize("employees", "create", Roles = "admin")]
        public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("employees", "delete", Roles = "admin")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            Result<object> result = await mediator.Send(new DeleteEmployeeCommand { Id = id });
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("employees", "update")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("employees", "read", Roles = "admin")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllEmployeeQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("employees", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailEmployeeQuery { Id = id });
            return HandleResult(result);
        }
    }
}
