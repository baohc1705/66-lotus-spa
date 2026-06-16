using _66SMS.API.Abstractions;
using _66SMS.Application.Features.MembershipCards.Commands.CreateMembershipCards;
using _66SMS.Application.Features.MembershipCards.Commands.DeleteMembershipCards;
using _66SMS.Application.Features.MembershipCards.Commands.UpdateMembershipCards;
using _66SMS.Application.Features.MembershipCards.Queries.GetAllMembershipCards;
using _66SMS.Application.Features.MembershipCards.Queries.GetDetailMembershipCard;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class MembershipCardsController : ApiController<MembershipCardsController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public MembershipCardsController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateMembershipCardCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMembershipCardCommand command)
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
            var command = new DeleteMembershipCardCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllMembershipCardQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailMembershipCardQuery { Id = id });
            return HandleResult(result);
        }
    }
}
