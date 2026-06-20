using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.MembershipCards.Commands.CreateMembershipCards
{
    public class CreateMembershipCardValidator : AbstractValidator<CreateMembershipCardCommand>
    {
        public CreateMembershipCardValidator()
        {
            RuleFor(x => x.CustomerId).NotEmpty();
            RuleFor(x => x.CardCode).MaximumLength(MembershipCardConst.CARD_CODE_MAX_LENGTH);
        }
    }
}
