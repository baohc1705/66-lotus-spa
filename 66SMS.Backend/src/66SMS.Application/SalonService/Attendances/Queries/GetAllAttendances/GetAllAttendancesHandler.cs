using _66SMS.Application.DTOs.Attendances;
using _66SMS.Application.SalonService.Helpers;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Attendances.Queries.GetAllAttendances
{
    public class GetAllAttendancesHandler : IRequestHandler<GetAllAttendancesQuery, Result<PagedResult<AttendanceDTO>>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;

        public GetAllAttendancesHandler(IAttendanceSqlRepository attendanceRepository)
        {
            this.attendanceRepository = attendanceRepository;
        }

        public async Task<Result<PagedResult<AttendanceDTO>>> Handle(GetAllAttendancesQuery request, CancellationToken cancellationToken)
        {
            var query = attendanceRepository.AsQueryable();

            if (request.StaffId.HasValue)
                query = query.Where(x => x.StaffId == request.StaffId);

            if (request.SalonId.HasValue)
                query = query.Where(x => x.SalonId == request.SalonId);

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status);

            if (request.FromDate.HasValue)
                query = query.Where(x => x.WorkDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(x => x.WorkDate <= request.ToDate.Value);

            query = request.IsDescending
                ? query.OrderByDescending(x => x.WorkDate).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.WorkDate).ThenBy(x => x.Id);

            query = query
                .Include(x => x.Staff)
                .Include(x => x.Salon)
                .Include(x => x.WorkSchedule!)
                .ThenInclude(w => w.ShiftPeriod!)
                .ThenInclude(sp => sp.Shift);

            PagedResult<Attendance> paged = await query.ToPagedAsync(request, cancellationToken);

            var pagedDto = new PagedResult<AttendanceDTO>
            {
                Items = paged.Items.Select(ToDto).ToList(),
                PageIndex = paged.PageIndex,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
            };

            return Result<PagedResult<AttendanceDTO>>.Success(pagedDto);
        }

        private static AttendanceDTO ToDto(Attendance x)
        {
            return new AttendanceDTO
            {
                Id = x.Id,
                StaffId = x.StaffId,
                StaffName = x.Staff?.FullName,
                SalonId = x.SalonId,
                SalonName = x.Salon?.Name,
                WorkScheduleId = x.WorkScheduleId,
                WorkDate = x.WorkDate,
                CheckInAt = x.CheckInAt,
                CheckOutAt = x.CheckOutAt,
                WorkedHours = x.WorkedHours,
                Status = x.Status,
                Note = x.Note,
                ShiftName = x.WorkSchedule?.ShiftPeriod?.Shift?.Name,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                WorkCredits = AttendanceWorkCreditCalculator.CalculateWorkCredit(x),
            };
        }
    }
}
