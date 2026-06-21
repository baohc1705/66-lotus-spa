using FluentValidation;

namespace _66SMS.Application.SalonService.Salons.Queries.GetDetailSalon
{
    /// <summary>
    /// Validator for <see cref="GetDetailSalonQuery"/>
    /// </summary>
    public class GetDetailSalonValidator : AbstractValidator<GetDetailSalonQuery>
    {
        public GetDetailSalonValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
