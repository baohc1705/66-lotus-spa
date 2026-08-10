using _66SMS.API.Abstractions;
using _66SMS.Application.SalonService.Salons.Commands.CreateSalon;
using _66SMS.Application.SalonService.Salons.Commands.DeleteSalon;
using _66SMS.Application.SalonService.Salons.Commands.UpdateSalon;
using _66SMS.Application.SalonService.Salons.Queries.GetAllSalons;
using _66SMS.Application.SalonService.Salons.Queries.GetDetailSalon;
using _66SMS.Application.SalonService.Salons.Queries.GetPrimarySalon;
using _66SMS.Domain.Enums;
using _66SMS.Infrastructure.Security;
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

        public SalonsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [PermissionAuthorize("salons", "create")]
        public async Task<IActionResult> Create([FromBody] CreateSalonCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("salons", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSalonCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("salons", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            DeleteSalonCommand command = new DeleteSalonCommand { Id = id };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] GetAllSalonsQuery query)
        {
            query.Status = (int)StatusActiveEnum.ACTIVED;
            query.IsDeleted = false;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("salons", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllSalonsQuery query)
        {
            query.IsDeleted = false;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("primary")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPrimary()
        {
            var result = await mediator.Send(new GetPrimarySalonQuery());
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
