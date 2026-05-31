using FluentValidation;

namespace _66SMS.Application.Features.Employees.Queries.GetDetailEmployee
{
    public class GetDetailEmployeeValidator : AbstractValidator<GetDetailEmployeeQuery>
    {
        public GetDetailEmployeeValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
