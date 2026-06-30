using _66SMS.API.Abstractions;
using _66SMS.Application.CatalogService.CertificateTypes.Commands.CreateCertificateType;
using _66SMS.Application.CatalogService.CertificateTypes.Commands.DeleteCertificateType;
using _66SMS.Application.CatalogService.CertificateTypes.Commands.UpdateCertificateType;
using _66SMS.Application.CatalogService.CertificateTypes.Queries.GetAllCertificateTypes;
using _66SMS.Application.CatalogService.CertificateTypes.Queries.GetDetailCertificateType;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class CertificateTypeController : ApiController<CertificateTypeController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public CertificateTypeController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("certificate", "create")]
        public async Task<IActionResult> Create([FromBody] CreateCertificateTypeCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("certificate", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCertificateTypeCommand command)
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
            var command = new DeleteCertificateTypeCommand { Id = id };
            var userId = jwtService.GetUserId();
            if (userId > 0) command.UpdatedBy = userId;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("certificate", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllCertificateTypesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int? status, string? filter, string? orderBy, bool? isDescending, int? pageIndex, int? pageSize)
        {
            var query = new GetAllCertificateTypesQuery
            {
                Status = status,
                Filter = filter,
                OrderBy = orderBy,
                IsDescending = isDescending ?? false,
                PageIndex = pageIndex ?? 1,
                PageSize = pageSize ?? 100,
                IsDeleted = false,
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailCertificateTypeQuery { Id = id });
            return HandleResult(result);
        }
    }
}
