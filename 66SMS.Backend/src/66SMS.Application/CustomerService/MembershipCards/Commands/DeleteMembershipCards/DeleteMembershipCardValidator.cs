using FluentValidation;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.DeleteMembershipCards
{
    /// <summary>
    /// validator for <see cref="DeleteMembershipCardCommand"/>
    /// </summary>
    public class DeleteMembershipCardValidator : AbstractValidator<DeleteMembershipCardCommand>
    {
        public DeleteMembershipCardValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
