using _66SMS.API.Abstractions;
using _66SMS.Application.CmsService.LandingBanners.Commands.CreateLandingBanner;
using _66SMS.Application.CmsService.LandingBanners.Commands.DeleteLandingBanner;
using _66SMS.Application.CmsService.LandingBanners.Commands.UpdateLandingBanner;
using _66SMS.Application.CmsService.LandingBanners.Queries.GetAllLandingBanners;
using _66SMS.Application.CmsService.LandingBanners.Queries.GetDetailLandingBanner;
using _66SMS.Domain.Enums;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class LandingBannersController : ApiController<LandingBannersController>
    {
        private readonly IMediator mediator;

        public LandingBannersController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpPost]
        [PermissionAuthorize("landing-banners", "create")]
        public async Task<IActionResult> Create([FromBody] CreateLandingBannerCommand command)
        {
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("landing-banners", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLandingBannerCommand command)
        {
            command.Id = id;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("landing-banners", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteLandingBannerCommand { Id = id });
            return HandleResult(result);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(string? filter, string? orderBy, bool? isDescending, int? pageIndex, int? pageSize)
        {
            var query = new GetAllLandingBannersQuery
            {
                Filter = filter,
                Status = (int)StatusActiveEnum.ACTIVED,
                IsDeleted = false,
                OrderBy = orderBy ?? "sortorder",
                IsDescending = isDescending ?? false,
                PageIndex = pageIndex ?? 1,
                PageSize = pageSize ?? 50,
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("landing-banners", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllLandingBannersQuery query)
        {
            query.IsDeleted = false;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("landing-banners", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailLandingBannerQuery { Id = id });
            return HandleResult(result);
        }
    }
}
