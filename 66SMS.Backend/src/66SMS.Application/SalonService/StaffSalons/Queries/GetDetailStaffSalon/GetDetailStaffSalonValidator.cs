using FluentValidation;

namespace _66SMS.Application.SalonService.StaffSalons.Queries.GetDetailStaffSalon
{
    public class GetDetailStaffSalonValidator : AbstractValidator<GetDetailStaffSalonQuery>
    {
        public GetDetailStaffSalonValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).When(x => x.Id != null);
            RuleFor(x => x.StaffId).GreaterThan(0).When(x => x.StaffId != null);
            RuleFor(x => x.SalonId).GreaterThan(0).When(x => x.SalonId != null);
        }
    }
}
