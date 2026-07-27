using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Contracts.Helpers;

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
                return Result<object>.BadRequest("Chỉ gán vị trí khi lịch hẹn đang chờ phục vụ (đã cọc).");
            }

            if (appointment.PositionId.HasValue)
            {
                return Result<object>.BadRequest("Lịch hẹn đã được gán vị trí.");
            }

            var position = await bookingPositionSqlRepository.AsQueryable()
                .Include(p => p.Room)
                .FirstOrDefaultAsync(p => p.Id == request.PositionId, cancellationToken);

            if (position == null)
            {
                return Result<object>.NotFound(BookingPositionConst.MSG_BOOKING_POSITION_NOT_FOUND, ErrorCodes.ERR_BOOKING_POSITION_NOT_FOUND);
            }

            if (appointment.SalonId.HasValue
                && position.Room?.SalonId != appointment.SalonId.Value)
            {
                return Result<object>.BadRequest("Vị trí không thuộc chi nhánh của lịch hẹn.");
            }

            if (!BookingPositionHelper.IsAvailable(position.Status))
            {
                return Result<object>.Conflict("Vị trí này đang được sử dụng. Vui lòng chọn vị trí khác.");
            }

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                appointment.PositionId = request.PositionId;
                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = request.UserId;

                BookingPositionHelper.MarkInService(position);

                appointmentSqlRepository.Update(appointment);
                bookingPositionSqlRepository.Update(position);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Success("Đã gán vị trí và cập nhật lịch hẹn thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
