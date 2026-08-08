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
            var today = now.ToDateOnly();

            var workSchedule = await workScheduleRepository.FindByIdAsync(
                request.WorkScheduleId!.Value, asNoTracking: true, cancellationToken);
            if (workSchedule == null
                || workSchedule.StaffId != request.StaffId
                || workSchedule.WorkDate != today)
                return Result<int>.BadRequest(
                    WorkScheduleConst.MSG_WORK_SCHEDULE_NOT_FOUND,
                    ErrorCodes.ERR_WORK_SCHEDULE_NOT_FOUND);

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
                WorkDate = today,
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
