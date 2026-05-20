using _66SMS.Application.Features.Users.Commands.CreateUser;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.Presentation.Controllers
{
    [ApiVersion("1.0")]
    public class UsersController : ApiController<UsersController>
    {
        private readonly ISender mediator;

        public UsersController(ISender mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Register(CreateUserCommand createUserCommand)
        {
            var result = await mediator.Send(createUserCommand);
            return HandleResult(result);
        }
    }
}
