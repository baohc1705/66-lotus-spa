using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using System.Data;

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
            var exists = await attendanceRepository.AnyAsync(
                x => x.StaffId == request.StaffId && x.WorkDate == (request.WorkDate ?? DateOnly.FromDateTime(DateTime.UtcNow)), cancellationToken);
            if (exists)
                return Result<int>.Conflict(AttendanceConst.MSG_DUPLICATE, ErrorCodes.ERR_ATTENDANCE_DUPLICATE);

            var attendance = new Attendance
            {
                StaffId = request.StaffId,
                SalonId = request.SalonId,
                WorkDate = request.WorkDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
                Status = request.Status,
                WorkedHours = 0,
                Note = request.Note,
                CreatedAt = DateTime.UtcNow,
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
