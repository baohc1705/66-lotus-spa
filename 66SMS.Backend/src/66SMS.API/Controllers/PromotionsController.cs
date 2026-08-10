using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Promotions.Commands.CreatePromotion;
using _66SMS.Application.BookingService.Promotions.Commands.DeletePromotion;
using _66SMS.Application.BookingService.Promotions.Commands.UpdatePromotion;
using _66SMS.Application.BookingService.Promotions.Queries.GetActivePromotions;
using _66SMS.Application.BookingService.Promotions.Queries.GetAllPromotions;
using _66SMS.Application.BookingService.Promotions.Queries.GetDetailPromotion;
using _66SMS.Application.BookingService.Promotions.Queries.ValidatePromotionCode;
using _66SMS.Contract.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class PromotionsController : ApiController<PromotionsController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public PromotionsController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("promotions", "create")]
        public async Task<IActionResult> CreatePromotion([FromBody] CreatePromotionCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("promotions", "update")]
        public async Task<IActionResult> UpdatePromotion(int id, [FromBody] UpdatePromotionCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("promotions", "delete")]
        public async Task<IActionResult> DeletePromotion(int id)
        {
            var command = new DeletePromotionCommand { Id = id, UpdatedBy = jwtService.GetUserId() };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("validate")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidateCode([FromQuery] ValidatePromotionCodeQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive()
        {
            var result = await mediator.Send(new GetActivePromotionsQuery());
            return HandleResult(result);
        }

        [HttpGet]
        [PermissionAuthorize("promotions", "read")]
        public async Task<IActionResult> GetAll([FromQuery] GetAllPromotionsQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("promotions", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailPromotionQuery { Id = id });
            return HandleResult(result);
        }
    }
}
