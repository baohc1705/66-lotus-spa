using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.CreateMembershipCards
{
    /// <summary>
    /// Validator for <see cref="CreateMembershipCardCommand"/>
    /// </summary>
    public class CreateMembershipCardValidator : AbstractValidator<CreateMembershipCardCommand>
    {
        public CreateMembershipCardValidator()
        {
            RuleFor(x => x.CustomerId).NotNull().GreaterThan(0);
            RuleFor(x => x.MembershipTierId)
                .GreaterThan(0)
                .When(x => x.MembershipTierId.HasValue);
            RuleFor(x => x.CardCode).MaximumLength(MembershipCardConst.CARD_CODE_MAX_LENGTH);
        }
    }
}
