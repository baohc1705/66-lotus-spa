using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.MembershipTiers.Commands.CreateMembershipTiers
{
    public class CreateMembershipTierValidator : AbstractValidator<CreateMembershipTierCommand>
    {
        public CreateMembershipTierValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(MembershipTierConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Benefits).MaximumLength(MembershipTierConst.BENEFITS_MAX_LENGTH);
        }
    }
}
