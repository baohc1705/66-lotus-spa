using _66SMS.Application.Features.Users.Queries.GetAllUsers;
using _66SMS.Application.Features.Users.Queries.GetDetailUser;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using _66SMS.Presentation.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.Presentation.Controllers
{
    [ApiVersion("1.0")]
    [Authorize]
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
        [HttpGet]
        [PermissionAuthorize("users", "list")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllUserQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }
    }
}
