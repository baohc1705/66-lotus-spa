using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentStaff
{
    public sealed class AssignAppointmentStaffCommand : IRequest<Result<object>>
    {
        public int AppointmentId { get; set; }
        public int StaffId { get; set; }
        public int? UserId { get; set; }
    }
}
