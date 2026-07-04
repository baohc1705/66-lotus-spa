using _66SMS.Application.SalonService.Helpers;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using System.Data;

namespace _66SMS.Application.SalonService.Attendances.Commands.UpdateAttendance
{
    public class UpdateAttendanceHandler : IRequestHandler<UpdateAttendanceCommand, Result<int>>
    {
        private readonly IAttendanceSqlRepository attendanceRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public UpdateAttendanceHandler(
            IAttendanceSqlRepository attendanceRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.attendanceRepository = attendanceRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(UpdateAttendanceCommand request, CancellationToken cancellationToken)
        {
            var attendance = await attendanceRepository.FindByIdAsync(request.Id, asNoTracking: false, cancellationToken);
            if (attendance == null)
                return Result<int>.NotFound(AttendanceConst.MSG_NOT_FOUND, ErrorCodes.ERR_ATTENDANCE_NOT_FOUND);

            if (request.CheckInAt.HasValue)
                attendance.CheckInAt = request.CheckInAt;
            if (request.CheckOutAt.HasValue)
                attendance.CheckOutAt = request.CheckOutAt;
            if (request.Note != null)
                attendance.Note = request.Note;

            if (request.Status.HasValue)
            {
                if (!IsAllowedStatus(request.Status.Value))
                    return Result<int>.BadRequest(AttendanceConst.MSG_INVALID_STATUS, ErrorCodes.ERR_ATTENDANCE_INVALID_STATUS);

                attendance.Status = request.Status.Value;
            }

            ApplyStatusSideEffects(attendance);

            attendance.UpdatedAt = DateTime.UtcNow;

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                attendanceRepository.Update(attendance);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<int>.Success(attendance.Id, AttendanceConst.MSG_UPDATE_SUCCESS);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private static bool IsAllowedStatus(int status) =>
            status == AttendanceConst.STATUS_CHECKED_IN
            || status == AttendanceConst.STATUS_CHECKED_OUT
            || status == AttendanceConst.STATUS_ABSENT
            || status == AttendanceConst.STATUS_PAID_LEAVE
            || status == AttendanceConst.STATUS_HOLIDAY
            || status == AttendanceConst.STATUS_UNPAID_LEAVE;

        private static void ApplyStatusSideEffects(Domain.Entities.Attendance attendance)
        {
            if (AttendanceWorkCreditCalculator.IsManualStatus(attendance.Status))
            {
                attendance.CheckInAt = null;
                attendance.CheckOutAt = null;
                attendance.WorkedHours = 0;
                return;
            }

            if (attendance.CheckInAt.HasValue && attendance.CheckOutAt.HasValue)
            {
                attendance.WorkedHours = Math.Round(
                    (decimal)(attendance.CheckOutAt.Value - attendance.CheckInAt.Value).TotalHours, 2);
                attendance.Status = AttendanceConst.STATUS_CHECKED_OUT;
            }
            else if (attendance.CheckInAt.HasValue)
            {
                attendance.WorkedHours = 0;
                attendance.Status = AttendanceConst.STATUS_CHECKED_IN;
            }
        }
    }
}
