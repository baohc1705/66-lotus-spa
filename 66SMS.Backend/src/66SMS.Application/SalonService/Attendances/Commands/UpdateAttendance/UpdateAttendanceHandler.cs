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

        public UpdateAttendanceHandler(IAttendanceSqlRepository attendanceRepository, ISqlUnitOfWork sqlUnitOfWork)
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

            // Tính lại số giờ làm & trạng thái theo giờ vào/ra hiện tại.
            if (attendance.CheckInAt.HasValue && attendance.CheckOutAt.HasValue)
            {
                attendance.WorkedHours = Math.Round((decimal)(attendance.CheckOutAt.Value - attendance.CheckInAt.Value).TotalHours, 2);
                attendance.Status = AttendanceConst.STATUS_CHECKED_OUT;
            }
            else if (attendance.CheckInAt.HasValue)
            {
                attendance.WorkedHours = 0;
                attendance.Status = AttendanceConst.STATUS_CHECKED_IN;
            }

            attendance.UpdatedAt = DateTime.UtcNow;
            attendance.UpdatedBy = request.UpdatedBy;

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
    }
}
