using FluentValidation;

namespace _66SMS.Application.Features.MembershipTiers.Commands.DeleteMembershipTiers
{
    public class DeleteMembershipTierValidator : AbstractValidator<DeleteMembershipTierCommand>
    {
        public DeleteMembershipTierValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
