using FluentValidation;

namespace _66SMS.Application.Features.Users.Queries.GetDetailUser
{
    public class GetDetailUserQueryValidator : AbstractValidator<GetDetailUserQuery>
    {
        public GetDetailUserQueryValidator()
        {
            RuleFor(x => x.Id).NotNull().NotEmpty().GreaterThan(0);
        }
    }
}
