using _66SMS.Application.DTOs.TreatmentCourses;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Queries.GetDetailTreatmentCourse
{
    public class GetDetailTreatmentCourseQuery : IRequest<Result<TreatmentCourseDTO>>
    {
        public int Id { get; set; }
    }
}
