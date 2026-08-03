using _66SMS.Contracts.Enumerations;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Staffs.Commands.UpdateMyBookingStatus
{
    public sealed class UpdateMyBookingStatusHandler : IRequestHandler<UpdateMyBookingStatusCommand, Result<object>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;

        public UpdateMyBookingStatusHandler(
            IStaffSqlRepository staffSqlRepository,
            IAppointmentSqlRepository appointmentSqlRepository,
            IBookingPositionSqlRepository bookingPositionSqlRepository)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
        }

        public async Task<Result<object>> Handle(UpdateMyBookingStatusCommand request, CancellationToken cancellationToken)
        {
            var staff = await staffSqlRepository.AsQueryable()
                .FirstOrDefaultAsync(s => s.UserId == request.UserId, cancellationToken);
            
            if (staff == null)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var appointment = await appointmentSqlRepository.AsQueryable(false)
                .FirstOrDefaultAsync(a => a.Id == request.Id && a.StaffId == staff.Id, cancellationToken);

            if (appointment == null)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_BOOKING_NOT_FOUND, ErrorCodes.ERR_STAFF_BOOKING_NOT_FOUND);

            if (request.Status == AppointmentConst.STATUS_IN_SERVICE
                && appointment.Status == AppointmentConst.STATUS_WAITING
                && appointment.TimeStartService == null)
            {
                appointment.TimeStartService = Contracts.Helpers.DateTimeHelper.UtcNow();
            }

            appointment.Status = request.Status;
            if (request.Note != null)
            {
                appointment.Note = request.Note;
            }

            if (request.Status == AppointmentConst.STATUS_COMPLETED)
            {
                appointment.CompletedAt = Contracts.Helpers.DateTimeHelper.UtcNow();
            }

            if (request.Status == AppointmentConst.STATUS_COMPLETED
                || request.Status == AppointmentConst.STATUS_CANCELLED
                || request.Status == AppointmentConst.STATUS_NO_SHOW)
            {
                await BookingPositionReleaseService.ReleasePositionIfNeededAsync(
                    appointment, bookingPositionSqlRepository, cancellationToken);
            }

            appointmentSqlRepository.Update(appointment);
            await appointmentSqlRepository.SaveChangeAsync(cancellationToken);

            return Result<object>.Success("Cập nhật trạng thái thành công");
        }
    }
}
