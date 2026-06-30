using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.DeleteTreatmentCourse
{
    public class DeleteTreatmentCourseCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
