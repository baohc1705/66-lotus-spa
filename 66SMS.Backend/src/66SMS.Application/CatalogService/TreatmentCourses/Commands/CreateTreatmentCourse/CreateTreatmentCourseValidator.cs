using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.CreateTreatmentCourse
{
    public class CreateTreatmentCourseValidator : AbstractValidator<CreateTreatmentCourseCommand>
    {
        public CreateTreatmentCourseValidator()
        {
            RuleFor(x => x.Code).NotNull().NotEmpty().MaximumLength(TreatmentCourseConst.CODE_MAX_LENGTH);
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(TreatmentCourseConst.NAME_MAX_LENGTH);
            RuleFor(x => x.SellingPrice).NotNull().GreaterThanOrEqualTo(0);
            RuleFor(x => x.OriginalPrice).NotNull().GreaterThanOrEqualTo(0);
            RuleFor(x => x.Description).MaximumLength(TreatmentCourseConst.DESCRIPTION_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Description));
            RuleFor(x => x.ImageUrl).MaximumLength(TreatmentCourseConst.IMAGE_URL_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ImageUrl));
            RuleFor(x => x.Items).NotNull().NotEmpty();

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(x => x.ServiceId).NotNull().GreaterThan(0);
                item.RuleFor(x => x.SessionNumber).NotNull().GreaterThan(0);
                item.RuleFor(x => x.Quantity).NotNull().GreaterThan(0);
            });
        }
    }
}
