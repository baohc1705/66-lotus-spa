using FluentValidation;

namespace _66SMS.Application.IdentityService.Users.Queries.GetDetailUser
{
    public class GetDetailUserQueryValidator : AbstractValidator<GetDetailUserQuery>
    {
        public GetDetailUserQueryValidator()
        {
            RuleFor(x => x.Id).NotNull().NotEmpty().GreaterThan(0);
        }
    }
}
