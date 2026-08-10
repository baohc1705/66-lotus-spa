using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.BookingPositions.Commands.DeleteBookingPositions
{
    public class DeleteBookingPositionCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
