using FluentValidation;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.DeleteTreatmentCourse
{
    public class DeleteTreatmentCourseValidator : AbstractValidator<DeleteTreatmentCourseCommand>
    {
        public DeleteTreatmentCourseValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
