using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Appointments.Commands.UpdateAppointment
{
    public class UpdateAppointmentCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
    }
}
