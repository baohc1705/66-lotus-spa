using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetStaffAvailability
{
    public class GetStaffAvailabilityValidator : AbstractValidator<GetStaffAvailabilityQuery>
    {
        public GetStaffAvailabilityValidator()
        {
            RuleFor(x => x.SlotId)
                .GreaterThan(0)
                .WithMessage(AppointmentConst.MSG_STAFF_AVAILABILITY_SLOT_REQUIRED);

            RuleFor(x => x.ServiceId)
                .GreaterThan(0)
                .WithMessage(AppointmentConst.MSG_STAFF_AVAILABILITY_SERVICE_REQUIRED);
        }
    }
}
