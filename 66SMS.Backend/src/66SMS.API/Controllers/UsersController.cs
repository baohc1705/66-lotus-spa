using _66SMS.API.Abstractions;
using _66SMS.Application.CustomerService.MembershipCards.Queries.GetDetailMembershipCard;
using _66SMS.Application.IdentityService.Users.Commands.DeleteUser;
using _66SMS.Application.IdentityService.Users.Commands.UpdateUser;
using _66SMS.Application.IdentityService.Users.Queries.GetAllUserAccounts;
using _66SMS.Application.IdentityService.Users.Queries.GetAllUsers;
using _66SMS.Application.IdentityService.Users.Queries.GetDetailUser;
using _66SMS.Application.IdentityService.Users.Queries.GetMyWallet;
using _66SMS.Application.IdentityService.Users.Queries.GetMyWalletTransactions;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GetAll([FromQuery] GetAllUserQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpDelete]
        [Authorize(Roles = "admin")]
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

        [HttpGet("me/wallet")]
        [Authorize]
        public async Task<IActionResult> GetMyWallet()
        {
            var result = await mediator.Send(new GetMyWalletQuery
            {
                UserId = jwtService.GetUserId()
            });
            return HandleResult(result);
        }

        [HttpGet("me/wallet/transactions")]
        [Authorize]
        public async Task<IActionResult> GetMyWalletTransactions()
        {
            var result = await mediator.Send(new GetMyWalletTransactionsQuery
            {
                UserId = jwtService.GetUserId()
            });
            return HandleResult(result);
        }

        [HttpGet("me/membership-card")]
        [Authorize]
        public async Task<IActionResult> GetMyMembershipCard()
        {
            var result = await mediator.Send(new GetDetailMembershipCardQuery
            {
                UserId = jwtService.GetUserId()
            });
            return HandleResult(result);
        }
        
        [HttpGet("accounts")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllAccounts([FromQuery] GetAllUserAccountQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }
    }
}
