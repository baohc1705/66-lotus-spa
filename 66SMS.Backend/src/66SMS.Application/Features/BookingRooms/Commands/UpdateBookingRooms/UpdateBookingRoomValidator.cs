using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.BookingRooms.Commands.UpdateBookingRooms
{
    public class UpdateBookingRoomValidator : AbstractValidator<UpdateBookingRoomCommand>
    {
        public UpdateBookingRoomValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(BookingRoomConst.NAME_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Name));
            RuleFor(x => x.ImageUrl).MaximumLength(BookingRoomConst.IMAGE_URL_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ImageUrl));
            RuleFor(x => x.Note).MaximumLength(BookingRoomConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
        }
    }
}
