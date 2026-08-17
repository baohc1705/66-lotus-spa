using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Cashier.Commands.CreateCashierAppointment
{
    public class CreateCashierAppointmentValidator : AbstractValidator<CreateCashierAppointmentCommand>
    {
        public CreateCashierAppointmentValidator()
        {
            RuleFor(x => x.ActorUserId).GreaterThan(0);
            RuleFor(x => x.CustomerId).GreaterThan(0);
            RuleFor(x => x.Guests).NotEmpty();
            RuleForEach(x => x.Guests).ChildRules(guest =>
            {
                guest.RuleFor(g => g.AppointmentDate).NotNull();
                guest.RuleFor(g => g)
                    .Must(g => g.LockId.HasValue || !string.IsNullOrWhiteSpace(g.StartTime))
                    .WithMessage("LockId hoặc StartTime là bắt buộc.");
                guest.RuleFor(g => g.Services).NotEmpty();
                guest.RuleForEach(g => g.Services).ChildRules(service =>
                {
                    service.RuleFor(s => s.ServiceId).NotNull().GreaterThan(0);
                    service.RuleFor(s => s.Quantity).NotNull().GreaterThanOrEqualTo(1);
                });
                guest.RuleFor(g => g.Services)
                    .Must(services =>
                    {
                        if (services == null)
                            return false;
                        var seen = new HashSet<int>();
                        for (var index = 0; index < services.Count; index++)
                        {
                            var id = services[index].ServiceId ?? 0;
                            if (id <= 0)
                                continue;
                            if (!seen.Add(id))
                                return false;
                        }
                        return seen.Count > 0;
                    })
                    .WithMessage(AppointmentConst.MSG_APPOINTMENT_DUPLICATE_SERVICE);
            });
        }
    }
}
