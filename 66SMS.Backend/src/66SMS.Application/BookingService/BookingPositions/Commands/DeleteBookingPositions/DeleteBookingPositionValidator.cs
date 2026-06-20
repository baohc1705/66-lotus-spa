using FluentValidation;

namespace _66SMS.Application.BookingService.BookingPositions.Commands.DeleteBookingPositions
{
    public class DeleteBookingPositionValidator : AbstractValidator<DeleteBookingPositionCommand>
    {
        public DeleteBookingPositionValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
