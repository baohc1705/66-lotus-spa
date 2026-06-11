using FluentValidation;

namespace _66SMS.Application.Features.BookingRooms.Commands.DeleteBookingRooms
{
    public class DeleteBookingRoomValidator : AbstractValidator<DeleteBookingRoomCommand>
    {
        public DeleteBookingRoomValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
