using _66SMS.Contract.Shared;
using MediatR;
using System;

namespace _66SMS.Application.BookingService.ConfigAppointments.Commands.CreateConfigAppointment
{
    public class CreateConfigAppointmentCommand : IRequest<Result<int>>
    {
        public int? DepositPercent { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public int? SlotMinutes { get; set; }
        public int? SalonId { get; set; }
    }
}
