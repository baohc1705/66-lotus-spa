using _66SMS.API.Abstractions;
using _66SMS.Application.Features.MembershipTiers.Commands.CreateMembershipTiers;
using _66SMS.Application.Features.MembershipTiers.Commands.DeleteMembershipTiers;
using _66SMS.Application.Features.MembershipTiers.Commands.UpdateMembershipTiers;
using _66SMS.Application.Features.MembershipTiers.Queries.GetAllMembershipTiers;
using _66SMS.Application.Features.MembershipTiers.Queries.GetDetailMembershipTier;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class MembershipTiersController : ApiController<MembershipTiersController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public MembershipTiersController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateMembershipTierCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMembershipTierCommand command)
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
            var command = new DeleteMembershipTierCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllMembershipTierQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailMembershipTierQuery { Id = id });
            return HandleResult(result);
        }
    }
}
