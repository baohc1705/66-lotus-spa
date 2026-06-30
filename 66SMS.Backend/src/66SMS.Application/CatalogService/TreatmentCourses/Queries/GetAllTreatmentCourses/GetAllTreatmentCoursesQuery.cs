using _66SMS.Application.DTOs.TreatmentCourses;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Queries.GetAllTreatmentCourses
{
    public class GetAllTreatmentCoursesQuery : PageRequest, IRequest<Result<PagedResult<TreatmentCourseDTO>>>
    {
        public int? Status { get; set; }
        public bool IsDeleted { get; set; } = true;
        public int? CategoryId { get; set; }
    }
}
