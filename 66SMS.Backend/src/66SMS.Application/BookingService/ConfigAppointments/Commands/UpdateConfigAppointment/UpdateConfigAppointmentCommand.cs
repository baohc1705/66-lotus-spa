using _66SMS.Contracts.Shared;
using MediatR;
using System;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.ConfigAppointments.Commands.UpdateConfigAppointment
{
    public class UpdateConfigAppointmentCommand : IRequest<Result<int>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public int? DepositPercent { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public int? SlotMinutes { get; set; }
        public int? SalonId { get; set; }
    }
}
