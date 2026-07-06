using _66SMS.API.Abstractions;
using _66SMS.Application.CatalogService.TreatmentCourses.Commands.CreateTreatmentCourse;
using _66SMS.Application.CatalogService.TreatmentCourses.Commands.DeleteTreatmentCourse;
using _66SMS.Application.CatalogService.TreatmentCourses.Commands.DeleteTreatmentCourseMultiples;
using _66SMS.Application.CatalogService.TreatmentCourses.Commands.UpdateTreatmentCourse;
using _66SMS.Application.CatalogService.TreatmentCourses.Queries.GetAllTreatmentCourses;
using _66SMS.Application.CatalogService.TreatmentCourses.Queries.GetDetailTreatmentCourse;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class TreatmentCourseController : ApiController<TreatmentCourseController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public TreatmentCourseController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("treatment-courses", "create")]
        public async Task<IActionResult> CreateTreatmentCourse([FromBody] CreateTreatmentCourseCommand command)
        {
            command.CreatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}")]
        [PermissionAuthorize("treatment-courses", "update")]
        public async Task<IActionResult> UpdateTreatmentCourse(int id, [FromBody] UpdateTreatmentCourseCommand command)
        {
            command.Id = id;
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [PermissionAuthorize("treatment-courses", "delete")]
        public async Task<IActionResult> DeleteTreatmentCourse(int id)
        {
            var command = new DeleteTreatmentCourseCommand { Id = id };
            var userId = jwtService.GetUserId();
            if (userId > 0) command.UpdatedBy = userId;
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("bulk")]
        [PermissionAuthorize("treatment-courses", "delete")]
        public async Task<IActionResult> DeleteMultiples([FromBody] DeleteTreatmentCourseMultiplesCommand command)
        {
            command.UpdatedBy = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("treatment-courses", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllTreatmentCoursesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("deleted")]
        [PermissionAuthorize("treatment-courses", "read")]
        public async Task<IActionResult> AdminGetAllDeleted([FromQuery] GetAllTreatmentCoursesQuery query)
        {
            query.IsDeleted = true;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int? categoryId, string? filter, string? orderBy, bool? isDescending, int? pageIndex, int? pageSize)
        {
            var query = new GetAllTreatmentCoursesQuery
            {
                CategoryId = categoryId,
                Filter = filter,
                OrderBy = orderBy,
                IsDescending  = isDescending ?? false,
                PageIndex = pageIndex ?? 1,
                PageSize = pageSize ?? 10,
                IsDeleted = false,
            };

            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailTreatmentCourseQuery { Id = id });
            return HandleResult(result);
        }
    }
}
