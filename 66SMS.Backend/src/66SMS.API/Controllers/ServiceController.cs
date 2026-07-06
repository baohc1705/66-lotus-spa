using _66SMS.API.Abstractions;
using _66SMS.Application.CatalogService.Services.Commands.CreateServices;
using _66SMS.Application.CatalogService.Services.Commands.DeleteServices;
using _66SMS.Application.CatalogService.Services.Commands.DeleteServiceMultiples;
using _66SMS.Application.CatalogService.Services.Commands.UpdateServices;
using _66SMS.Application.CatalogService.Services.Queries.GetAllServices;
using _66SMS.Application.CatalogService.Services.Queries.GetDetailService;
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
    public class ServiceController : ApiController<ServiceController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public ServiceController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet("admin")]
        [PermissionAuthorize("services", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllServicesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("deleted")]
        [PermissionAuthorize("services", "read")]
        public async Task<IActionResult> AdminGetAllDeleted([FromQuery] GetAllServicesQuery query)
        {
            query.IsDeleted = true;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(int? categoryId, string? keyword, decimal? minPrice, decimal? maxPrice, string? orderBy, bool? isDescending, int? pageIndex, int? pageSize)
        {
            GetAllServicesQuery query = new()
            {
                CategoryId = categoryId,
                Keyword = keyword,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                Status = ServiceConst.STATUS_ACTIVED,
                OrderBy = orderBy,
                IsDescending = isDescending ?? false,
                PageIndex = pageIndex ?? 1,
                PageSize = pageSize ?? 10,
            };

            var result = await mediator.Send(query);

            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await mediator.Send(new GetDetailServicesQuery { Id = id });
            return HandleResult(result);
        }

        [HttpPost]
        [PermissionAuthorize("services", "create")]
        public async Task<IActionResult> Create([FromBody] CreateServiceCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("services", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceCommand command)
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
            var command = new DeleteServiceCommand { Id = id };
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("bulk")]
        [PermissionAuthorize("services", "delete")]
        public async Task<IActionResult> DeleteMultiples([FromBody] DeleteServiceMultiplesCommand command)
        {
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
