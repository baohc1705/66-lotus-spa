using _66SMS.Application.DTOs.Attendances;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Attendances.Queries.GetDetailAttendance
{
    public class GetDetailAttendanceQuery : IRequest<Result<AttendanceDTO>>
    {
        public int Id { get; set; }
    }
}
