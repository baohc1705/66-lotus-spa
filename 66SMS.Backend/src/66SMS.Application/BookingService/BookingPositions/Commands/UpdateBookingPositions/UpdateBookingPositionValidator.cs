using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.BookingPositions.Commands.UpdateBookingPositions
{
    public class UpdateBookingPositionValidator : AbstractValidator<UpdateBookingPositionCommand>
    {
        public UpdateBookingPositionValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(BookingPositionConst.NAME_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Name));
            RuleFor(x => x.Note).MaximumLength(BookingPositionConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
        }
    }
}
