using _66SMS.API.Abstractions;
using _66SMS.Application.Notifications.Commands.ClearMyNotifications;
using _66SMS.Application.Notifications.Commands.MarkAllNotificationsRead;
using _66SMS.Application.Notifications.Queries.GetMyNotifications;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [Authorize]
    [ApiVersion("1.0")]
    public class NotificationsController : ApiController<NotificationsController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public NotificationsController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMine([FromQuery] string? domain, [FromQuery] int take = 30)
        {
            var result = await mediator.Send(new GetMyNotificationsQuery
            {
                UserId = jwtService.GetUserId(),
                Domain = domain,
                Take = take,
            });
            return HandleResult(result);
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            var result = await mediator.Send(new MarkAllNotificationsReadCommand
            {
                UserId = jwtService.GetUserId(),
            });
            return HandleResult(result);
        }

        [HttpDelete]
        public async Task<IActionResult> ClearMine()
        {
            var result = await mediator.Send(new ClearMyNotificationsCommand
            {
                UserId = jwtService.GetUserId(),
            });
            return HandleResult(result);
        }
    }
}
