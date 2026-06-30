using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckIn
{
    public class CheckInHandler : IRequestHandler<CheckInCommand, Result<int>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CheckInHandler(IAttendanceSqlRepository attendanceRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.attendanceRepository = attendanceRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(CheckInCommand request, CancellationToken cancellationToken)
        {
            var now = DateTime.Now;
            var today = DateOnly.FromDateTime(now);

            var exists = await attendanceRepository.AnyAsync(
                x => x.StaffId == request.StaffId && x.WorkDate == today, cancellationToken);
            if (exists)
                return Result<int>.Conflict(AttendanceConst.MSG_DUPLICATE, ErrorCodes.ERR_ATTENDANCE_DUPLICATE);

            var attendance = new Attendance
            {
                StaffId = request.StaffId,
                SalonId = request.SalonId,
                WorkScheduleId = request.WorkScheduleId,
                WorkDate = today,
                CheckInAt = now,
                WorkedHours = 0,
                Status = AttendanceConst.STATUS_CHECKED_IN,
                Note = request.Note,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.CreatedBy,
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
