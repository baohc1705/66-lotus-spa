using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Users.Commands.DeleteUser;
using _66SMS.Application.Features.Users.Commands.UpdateUser;
using _66SMS.Application.Features.Users.Queries.GetAllUsers;
using _66SMS.Application.Features.Users.Queries.GetDetailUser;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Asp.Versioning;

namespace _66SMS.API.Controllers
{
    [Authorize]
    [ApiVersion("1.0")]
    public class UsersController : ApiController<UsersController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public UsersController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            int id = jwtService.GetUserId();
            var result = await mediator.Send(new GetDetailUserQuery { Id = id });
            return HandleResult(result);
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserCommand command)
        {
            command.Id = jwtService.GetUserId();
            command.UpdatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        [PermissionAuthorize("users", "read")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllUserQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpDelete]
        [PermissionAuthorize("users", "delete")]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserCommand command)
        {
            command.UpdatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPut]
        [PermissionAuthorize("users", "update")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserCommand command)
        {
            command.UpdatedBy = jwtService.GetUserId();
            Result<object> result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
