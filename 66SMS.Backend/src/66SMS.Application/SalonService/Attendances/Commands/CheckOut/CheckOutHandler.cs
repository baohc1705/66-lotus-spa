using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckOut
{
    public class CheckOutHandler : IRequestHandler<CheckOutCommand, Result<int>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;
        private readonly IWorkScheduleSqlRepository workScheduleRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CheckOutHandler(
            IAttendanceSqlRepository attendanceRepository,
            IWorkScheduleSqlRepository workScheduleRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.attendanceRepository = attendanceRepository;
            this.workScheduleRepository = workScheduleRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(CheckOutCommand request, CancellationToken cancellationToken)
        {
            var now = DateTimeHelper.UtcNow();
            var today = DateTimeHelper.VnToday();

            var workSchedule = await workScheduleRepository.AsQueryable(asNoTracking: true)
                .Include(x => x.Shift)
                .FirstOrDefaultAsync(x => x.Id == request.WorkScheduleId!.Value, cancellationToken);

            if (workSchedule == null || workSchedule.StaffId != request.StaffId)
                return Result<int>.BadRequest(
                    WorkScheduleConst.MSG_WORK_SCHEDULE_NOT_FOUND,
                    ErrorCodes.ERR_WORK_SCHEDULE_NOT_FOUND);

            if (workSchedule.WorkDate < today)
                return Result<int>.BadRequest(
                    AttendanceConst.MSG_CANNOT_CHECK_OUT_PAST,
                    ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

            if (workSchedule.WorkDate > today)
                return Result<int>.BadRequest(
                    AttendanceConst.MSG_CANNOT_CHECK_OUT_FUTURE,
                    ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

            // DEMO: đang comment — bỏ comment khối này để bật ràng buộc giờ.
            // Check-out: từ start đến (end + 1h).
            
            // var shiftStart = workSchedule.ShiftStart ?? workSchedule.Shift?.ShiftStart;
            // var shiftEnd = workSchedule.ShiftEnd ?? workSchedule.Shift?.ShiftEnd;
            // if (shiftStart == null || shiftEnd == null)
            //     return Result<int>.BadRequest(AttendanceConst.MSG_SHIFT_TIME_REQUIRED, ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

            // var vnNowTime = DateTimeHelper.VnNowTime();
            // var latest = shiftEnd.Value.AddMinutes(AttendanceConst.SHIFT_TIME_BUFFER_MINUTES);

            // if (vnNowTime < shiftStart.Value)
            //     return Result<int>.BadRequest(AttendanceConst.MSG_CHECK_OUT_TOO_EARLY, ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

            // if (vnNowTime > latest)
            //     return Result<int>.BadRequest(AttendanceConst.MSG_CHECK_OUT_TOO_LATE, ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);
            

            var attendance = await attendanceRepository
                .AsQueryable(asNoTracking: false)
                .Where(x => x.StaffId == request.StaffId
                    && x.WorkScheduleId == request.WorkScheduleId
                    && x.WorkDate == workSchedule.WorkDate
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
