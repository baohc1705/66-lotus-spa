using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckIn
{
    public class CheckInHandler : IRequestHandler<CheckInCommand, Result<int>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;
        private readonly IWorkScheduleSqlRepository workScheduleRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CheckInHandler(
            IAttendanceSqlRepository attendanceRepository,
            IWorkScheduleSqlRepository workScheduleRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.attendanceRepository = attendanceRepository;
            this.workScheduleRepository = workScheduleRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(CheckInCommand request, CancellationToken cancellationToken)
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
                    AttendanceConst.MSG_CANNOT_CHECK_IN_PAST,
                    ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

            if (workSchedule.WorkDate > today)
                return Result<int>.BadRequest(
                    AttendanceConst.MSG_CANNOT_CHECK_IN_FUTURE,
                    ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

            // DEMO: đang comment — bỏ comment khối này để bật ràng buộc giờ.
            // Check-in: từ (start - 1h) đến end.
            
            // var shiftStart = workSchedule.ShiftStart ?? workSchedule.Shift?.ShiftStart;
            // var shiftEnd = workSchedule.ShiftEnd ?? workSchedule.Shift?.ShiftEnd;
            // if (shiftStart == null || shiftEnd == null)
            //     return Result<int>.BadRequest(AttendanceConst.MSG_SHIFT_TIME_REQUIRED, ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

            // var vnNowTime = DateTimeHelper.VnNowTime();
            // var earliest = shiftStart.Value.AddMinutes(-AttendanceConst.SHIFT_TIME_BUFFER_MINUTES);

            // if (vnNowTime < earliest)
            //     return Result<int>.BadRequest(AttendanceConst.MSG_CHECK_IN_TOO_EARLY, ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

            // if (vnNowTime > shiftEnd.Value)
            //     return Result<int>.BadRequest(AttendanceConst.MSG_CHECK_IN_TOO_LATE, ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);
            

            var exists = await attendanceRepository.AnyAsync(
                x => x.StaffId == request.StaffId && x.WorkScheduleId == request.WorkScheduleId,
                cancellationToken);
            if (exists)
                return Result<int>.Conflict(AttendanceConst.MSG_DUPLICATE, ErrorCodes.ERR_ATTENDANCE_DUPLICATE);

            var attendance = new Attendance
            {
                StaffId = request.StaffId,
                SalonId = request.SalonId ?? workSchedule.SalonId,
                WorkScheduleId = request.WorkScheduleId,
                WorkDate = workSchedule.WorkDate,
                CheckInAt = now,
                Status = AttendanceConst.STATUS_CHECKED_IN,
                Note = request.Note,
                CreatedAt = DateTimeHelper.UtcNow(),
            };

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                attendanceRepository.Add(attendance);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Created(attendance.Id, AttendanceConst.MSG_CHECK_IN_SUCCESS);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
