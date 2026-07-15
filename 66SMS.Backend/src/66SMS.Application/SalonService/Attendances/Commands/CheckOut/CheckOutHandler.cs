using _66SMS.Application.SalonService.Helpers;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckOut
{
    public class CheckOutHandler : IRequestHandler<CheckOutCommand, Result<int>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CheckOutHandler(
            IAttendanceSqlRepository attendanceRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.attendanceRepository = attendanceRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(CheckOutCommand request, CancellationToken cancellationToken)
        {
            if (!request.WorkScheduleId.HasValue || request.WorkScheduleId <= 0)
                return Result<int>.BadRequest(
                    AttendanceConst.MSG_WORK_SCHEDULE_REQUIRED,
                    ErrorCodes.ERR_ATTENDANCE_WORK_SCHEDULE_REQUIRED);

            var now = DateTimeHelper.UtcNow();
            var today = now.ToDateOnly();

            var attendance = await attendanceRepository
                .AsQueryable(asNoTracking: false)
                .Where(x => x.StaffId == request.StaffId
                    && x.WorkScheduleId == request.WorkScheduleId
                    && x.WorkDate == today
                    && x.Status == AttendanceConst.STATUS_CHECKED_IN)
                .FirstOrDefaultAsync(cancellationToken);

            if (attendance == null || attendance.CheckInAt == null)
                return Result<int>.BadRequest(AttendanceConst.MSG_NOT_CHECKED_IN, ErrorCodes.ERR_ATTENDANCE_NOT_CHECKED_IN);

            attendance.CheckOutAt = now;
            attendance.WorkedHours = Math.Round((decimal)(now - attendance.CheckInAt.Value).TotalHours, 2);
            attendance.Status = AttendanceConst.STATUS_CHECKED_OUT;
            attendance.UpdatedAt = DateTimeHelper.UtcNow();

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                attendanceRepository.Update(attendance);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Success(attendance.Id, AttendanceConst.MSG_CHECK_OUT_SUCCESS);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
