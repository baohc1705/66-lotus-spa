using _66SMS.Application.DTOs.Attendances;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Attendances.Queries.GetAllAttendances
{
    public class GetAllAttendancesQuery : PageRequest, IRequest<Result<PagedResult<AttendanceDTO>>>
    {
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
        public int? Status { get; set; }
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
    }
}
