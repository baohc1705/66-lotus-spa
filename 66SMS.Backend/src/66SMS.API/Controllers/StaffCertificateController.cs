using _66SMS.API.Abstractions;
using _66SMS.Application.CatalogService.StaffCertificates.Commands.CreateStaffCertificate;
using _66SMS.Application.CatalogService.StaffCertificates.Commands.DeleteStaffCertificate;
using _66SMS.Application.CatalogService.StaffCertificates.Commands.UpdateStaffCertificate;
using _66SMS.Application.CatalogService.StaffCertificates.Queries.GetAllStaffCertificates;
using _66SMS.Application.CatalogService.StaffCertificates.Queries.GetDetailStaffCertificate;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class StaffCertificateController : ApiController<StaffCertificateController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public StaffCertificateController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("certificate", "create")]
        public async Task<IActionResult> Create([FromBody] CreateStaffCertificateCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("certificate", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffCertificateCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("certificate", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteStaffCertificateCommand { Id = id };
            var userId = jwtService.GetUserId();
            if (userId > 0) command.UpdatedBy = userId;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("certificate", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllStaffCertificatesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int? staffId, int? status, int? expiringInDays, string? filter, string? orderBy, bool? isDescending, int? pageIndex, int? pageSize)
        {
            var query = new GetAllStaffCertificatesQuery
            {
                StaffId = staffId,
                Status = status,
                ExpiringInDays = expiringInDays,
                Filter = filter,
                OrderBy = orderBy,
                IsDescending = isDescending ?? false,
                PageIndex = pageIndex ?? 1,
                PageSize = pageSize ?? 20,
                IsDeleted = false,
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailStaffCertificateQuery { Id = id });
            return HandleResult(result);
        }
    }
}
