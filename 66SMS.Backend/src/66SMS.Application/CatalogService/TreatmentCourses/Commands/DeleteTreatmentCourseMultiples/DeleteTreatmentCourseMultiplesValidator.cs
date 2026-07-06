using FluentValidation;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.DeleteTreatmentCourseMultiples
{
    public class DeleteTreatmentCourseMultiplesValidator : AbstractValidator<DeleteTreatmentCourseMultiplesCommand>
    {
        public DeleteTreatmentCourseMultiplesValidator()
        {
            RuleFor(x => x.Ids).NotEmpty();
            RuleFor(x => x.Ids).Must(x => x.Distinct().Count() == x.Count);
        }
    }
}
