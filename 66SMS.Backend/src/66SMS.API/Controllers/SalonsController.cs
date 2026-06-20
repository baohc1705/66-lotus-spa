using _66SMS.API.Abstractions;
using _66SMS.Application.DTOs.Salons;
using _66SMS.Application.SalonService.Salons.Commands.CreateSalon;
using _66SMS.Application.SalonService.Salons.Commands.DeleteSalon;
using _66SMS.Application.SalonService.Salons.Commands.UpdateSalon;
using _66SMS.Application.SalonService.Salons.Queries.GetAllSalons;
using _66SMS.Application.SalonService.Salons.Queries.GetDetailSalon;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class SalonsController : ApiController<SalonsController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public SalonsController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateSalonCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSalonCommand command)
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
            DeleteSalonCommand command = new DeleteSalonCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive()
        {
            var query = new GetAllSalonsQuery { Status = 1, PageSize = 100, PageIndex = 1 };
            var result = await mediator.Send(query);
            if (!result.IsSuccess)
                return HandleResult(result);
            return HandleResult(Result<IReadOnlyList<SalonDto>>.Success(result.Data!.Items));
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllSalonsQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailSalonQuery { Id = id });
            return HandleResult(result);
        }
    }
}
