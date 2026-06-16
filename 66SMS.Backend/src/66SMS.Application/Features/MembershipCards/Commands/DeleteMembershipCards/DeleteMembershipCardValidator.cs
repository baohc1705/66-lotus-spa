using FluentValidation;

namespace _66SMS.Application.Features.MembershipCards.Commands.DeleteMembershipCards
{
    public class DeleteMembershipCardValidator : AbstractValidator<DeleteMembershipCardCommand>
    {
        public DeleteMembershipCardValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
