using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.BookingPositions.Commands.CreateBookingPositions
{
    public class CreateBookingPositionValidator : AbstractValidator<CreateBookingPositionCommand>
    {
        public CreateBookingPositionValidator()
        {
            RuleFor(x => x.RoomId).NotNull().GreaterThan(0);
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(BookingPositionConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Note).MaximumLength(BookingPositionConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
        }
    }
}
