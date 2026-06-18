using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Me.Queries.GetMySalon;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class MeController : ApiController<MeController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public MeController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet("salon")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMySalon()
        {
            var salonId = jwtService.GetClaim<int?>("salon_id");
            var query = new GetMySalonQuery { SalonId = salonId };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }
    }
}
