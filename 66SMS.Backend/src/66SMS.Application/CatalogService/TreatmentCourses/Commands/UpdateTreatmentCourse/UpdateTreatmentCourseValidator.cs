using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.UpdateTreatmentCourse
{
    public class UpdateTreatmentCourseValidator : AbstractValidator<UpdateTreatmentCourseCommand>
    {
        public UpdateTreatmentCourseValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(TreatmentCourseConst.CODE_MAX_LENGTH).When(x => x.Code != null);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(TreatmentCourseConst.NAME_MAX_LENGTH).When(x => x.Name != null);
            RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0).When(x => x.SellingPrice.HasValue);
            RuleFor(x => x.OriginalPrice).GreaterThanOrEqualTo(0).When(x => x.OriginalPrice.HasValue);
            RuleFor(x => x.Description).MaximumLength(TreatmentCourseConst.DESCRIPTION_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Description));
            RuleFor(x => x.ImageUrl).MaximumLength(TreatmentCourseConst.IMAGE_URL_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ImageUrl));

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(x => x.ServiceId).NotNull().GreaterThan(0);
                item.RuleFor(x => x.SessionNumber).NotNull().GreaterThan(0);
                item.RuleFor(x => x.Quantity).NotNull().GreaterThan(0);
            }).When(x => x.Items != null && x.Items.Any());
        }
    }
}
