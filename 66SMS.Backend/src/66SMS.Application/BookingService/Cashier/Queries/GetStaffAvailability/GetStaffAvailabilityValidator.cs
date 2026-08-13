using _66SMS.Contract.Helpers;
using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetStaffAvailability
{
    public class GetStaffAvailabilityValidator : AbstractValidator<GetStaffAvailabilityQuery>
    {
        public GetStaffAvailabilityValidator()
        {
            RuleFor(x => x.StartTime)
                .Must(t => DateTimeHelper.ParseTimeOnly(t) != null)
                .WithMessage(AppointmentConst.MSG_STAFF_AVAILABILITY_SLOT_REQUIRED);

            RuleFor(x => x)
                .Must(x => (x.ServiceIds != null && x.ServiceIds.Count > 0)
                    || (x.ServiceId.HasValue && x.ServiceId.Value > 0))
                .WithMessage(AppointmentConst.MSG_STAFF_AVAILABILITY_SERVICE_REQUIRED);
        }
    }
}
