using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.SalonService.Attendances.Commands.CreateManualAttendance
{
    public class CreateManualAttendanceHandler : IRequestHandler<CreateManualAttendanceCommand, Result<int>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateManualAttendanceHandler(IAttendanceSqlRepository attendanceRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.attendanceRepository = attendanceRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(CreateManualAttendanceCommand request, CancellationToken cancellationToken)
        {
            var workDate = request.WorkDate ?? DateTimeHelper.UtcNow().ToDateOnly();

            // Mỗi ca (workSchedule) một bản ghi — tránh đụng các ca khác cùng ngày
            bool exists;
            if (request.WorkScheduleId.HasValue && request.WorkScheduleId > 0)
            {
                exists = await attendanceRepository.AnyAsync(
                    x => x.StaffId == request.StaffId && x.WorkScheduleId == request.WorkScheduleId,
                    cancellationToken);
            }
            else
            {
                exists = await attendanceRepository.AnyAsync(
                    x => x.StaffId == request.StaffId
                        && x.WorkDate == workDate
                        && x.WorkScheduleId == null,
                    cancellationToken);
            }

            if (exists)
                return Result<int>.Conflict(AttendanceConst.MSG_DUPLICATE, ErrorCodes.ERR_ATTENDANCE_DUPLICATE);

            var attendance = new Attendance
            {
                StaffId = request.StaffId,
                SalonId = request.SalonId,
                WorkScheduleId = request.WorkScheduleId,
                WorkDate = workDate,
                Status = request.Status,
                WorkedHours = 0,
                Note = request.Note,
                CreatedAt = DateTimeHelper.UtcNow(),
            };

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                attendanceRepository.Add(attendance);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Created(attendance.Id, AttendanceConst.MSG_CREATE_MANUAL_SUCCESS);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
