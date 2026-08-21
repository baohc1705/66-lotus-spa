using _66SMS.API.Abstractions;
using _66SMS.API.Filters;
using _66SMS.Application.NotificationService.Emails.Commands.SendManualEmail;
using _66SMS.Domain.Constants;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    [Authorize]
    public class EmailsController : ApiController<EmailsController>
    {
        private readonly IMediator mediator;

        public EmailsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendManualEmail([FromBody] SendManualEmailCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
