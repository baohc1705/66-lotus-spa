using _66SMS.Application.DTOs.Attendances;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using AttendanceMapper = _66SMS.Application.SalonService.Helpers.AttendanceMapper;

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
            {
                var from = DateOnly.FromDateTime(request.FromDate.Value);
                query = query.Where(x => x.WorkDate >= from);
            }

            if (request.ToDate.HasValue)
            {
                var to = DateOnly.FromDateTime(request.ToDate.Value);
                query = query.Where(x => x.WorkDate <= to);
            }

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
                Items = paged.Items.Select(AttendanceMapper.ToDto).ToList(),
                PageIndex = paged.PageIndex,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
            };

            return Result<PagedResult<AttendanceDTO>>.Success(pagedDto);
        }
    }
}
