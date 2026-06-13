using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Staffs.Commands.UpdateMyBookingStatus
{
    public sealed class UpdateMyBookingStatusCommand : IRequest<Result<object>>
    {
        public int UserId { get; set; }
        public int Id { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }
    }
}
