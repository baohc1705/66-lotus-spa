using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Commands.AssignAppointmentPosition
{
    public sealed class AssignAppointmentPositionHandler(
        IAppointmentSqlRepository appointmentSqlRepository,
        IBookingPositionSqlRepository bookingPositionSqlRepository,
        ISqlUnitOfWork sqlUnitOfWork)
        : IRequestHandler<AssignAppointmentPositionCommand, Result<object>>
    {
        public async Task<Result<object>> Handle(
            AssignAppointmentPositionCommand request,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable()
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
            {
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            }

            if (appointment.Status != AppointmentConst.STATUS_WAITING)
            {
                return Result<object>.BadRequest("Chỉ gán/đổi vị trí khi lịch hẹn đang chờ phục vụ.");
            }

            if (appointment.PositionId == request.PositionId)
            {
                return Result<object>.Success("Vị trí không thay đổi.");
            }

            var newPosition = await bookingPositionSqlRepository.AsQueryable()
                .Include(p => p.Room)
                .FirstOrDefaultAsync(p => p.Id == request.PositionId, cancellationToken);

            if (newPosition == null)
            {
                return Result<object>.NotFound(BookingPositionConst.MSG_BOOKING_POSITION_NOT_FOUND, ErrorCodes.ERR_BOOKING_POSITION_NOT_FOUND);
            }

            if (appointment.SalonId.HasValue
                && newPosition.Room?.SalonId != appointment.SalonId.Value)
            {
                return Result<object>.BadRequest("Vị trí không thuộc chi nhánh của lịch hẹn.");
            }

            if (!BookingPositionHelper.IsAvailable(newPosition.Status))
            {
                return Result<object>.Conflict("Vị trí này đang được sử dụng. Vui lòng chọn vị trí khác.");
            }

            // Vị trí đã gắn lịch chờ phục vụ khác trong cùng ngày → không cho chọn
            var takenByOther = await appointmentSqlRepository.AsQueryable(asNoTracking: true)
                .AnyAsync(
                    a => a.Id != appointment.Id
                        && a.PositionId == request.PositionId
                        && a.AppointmentDate == appointment.AppointmentDate
                        && (a.Status == AppointmentConst.STATUS_WAITING
                            || a.Status == AppointmentConst.STATUS_IN_SERVICE
                            || a.Status == AppointmentConst.STATUS_PENDING
                            || a.Status == AppointmentConst.STATUS_CONFIRMED),
                    cancellationToken);

            if (takenByOther)
            {
                return Result<object>.Conflict("Vị trí này đã có lịch hẹn khác. Vui lòng chọn vị trí khác.");
            }

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (appointment.PositionId.HasValue)
                {
                    var oldPosition = await bookingPositionSqlRepository.AsQueryable()
                        .FirstOrDefaultAsync(p => p.Id == appointment.PositionId.Value, cancellationToken);
                    if (oldPosition != null)
                    {
                        BookingPositionHelper.MarkAvailable(oldPosition);
                        bookingPositionSqlRepository.Update(oldPosition);
                    }
                }

                appointment.PositionId = request.PositionId;
                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = request.UserId;

                BookingPositionHelper.MarkInService(newPosition);

                appointmentSqlRepository.Update(appointment);
                bookingPositionSqlRepository.Update(newPosition);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Success("Đã cập nhật vị trí thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
