using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Queries.GetAllTreatmentCourses
{
    public class GetAllTreatmentCoursesQuery : PageRequest, IRequest<Result<PagedResult<TreatmentCourseDTO>>>
    {
        public int? Status { get; set; }
        public bool IsDeleted { get; set; } = false;
        public int? CategoryId { get; set; }
    }
}
