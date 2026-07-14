using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CustomerService.MembershipTiers.Commands.UpdateMembershipTiers
{
    public class UpdateMembershipTierValidator : AbstractValidator<UpdateMembershipTierCommand>
    {
        public UpdateMembershipTierValidator()
        {
            RuleFor(x => x.Code).MaximumLength(MembershipTierConst.CODE_MAX_LENGTH).When(x => !string.IsNullOrWhiteSpace(x.Code));
            RuleFor(x => x.Name).MaximumLength(MembershipTierConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Benefits).MaximumLength(MembershipTierConst.BENEFITS_MAX_LENGTH);
        }
    }
}
