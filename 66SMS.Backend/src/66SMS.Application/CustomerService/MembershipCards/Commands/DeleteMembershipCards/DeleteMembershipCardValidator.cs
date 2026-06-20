using FluentValidation;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.DeleteMembershipCards
{
    public class DeleteMembershipCardValidator : AbstractValidator<DeleteMembershipCardCommand>
    {
        public DeleteMembershipCardValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
