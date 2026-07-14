using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms
{
    public class CreateBookingRoomValidator : AbstractValidator<CreateBookingRoomCommand>
    {
        public CreateBookingRoomValidator()
        {
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(BookingRoomConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Note).MaximumLength(BookingRoomConst.NOTE_MAX_LENGTH);
        }
    }
}
