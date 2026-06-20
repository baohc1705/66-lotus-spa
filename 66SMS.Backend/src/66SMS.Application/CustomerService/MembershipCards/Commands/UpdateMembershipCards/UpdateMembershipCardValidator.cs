using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.UpdateMembershipCards
{
    public class UpdateMembershipCardValidator : AbstractValidator<UpdateMembershipCardCommand>
    {
        public UpdateMembershipCardValidator()
        {
            RuleFor(x => x.CardCode).MaximumLength(MembershipCardConst.CARD_CODE_MAX_LENGTH);
        }
    }
}
