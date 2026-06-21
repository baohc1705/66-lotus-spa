using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Appointments.Queries.GetDetailAppointment;
using _66SMS.Application.CatalogService.ServiceCategories.Commands.CreateServiceCategories;
using _66SMS.Application.CatalogService.ServiceCategories.Commands.DeleteServiceCategories;
using _66SMS.Application.CatalogService.ServiceCategories.Commands.UpdateServiceCategories;
using _66SMS.Application.CatalogService.ServiceCategories.Queries.GetAllServiceCategories;
using _66SMS.Contracts.Abstractions;
using _66SMS.Domain.Constants;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class ServiceCategoryController : ApiController<ServiceCategoryController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public ServiceCategoryController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(string? keyword, string? orderBy, bool? isDescending, int? pageIndex, int? pageSize)
        {
            var query = new GetAllServiceCategoriesQuery
            {
                Keyword = keyword,
                Status =  ServiceCategoryConst.STATUS_ACTIVED,
                OrderBy = orderBy,
                IsDescending = isDescending ?? false,
                PageIndex = pageIndex ?? 1,
                PageSize = pageSize ?? 10
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await mediator.Send(new GetDetailAppointmentQuery { Id = id });
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("services", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllServiceCategoriesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpPost]
        [PermissionAuthorize("services", "create")]
        public async Task<IActionResult> Create([FromBody] CreateServiceCategoriesCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("services", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceCategoriesCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("services", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteServiceCategoriesCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
