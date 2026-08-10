using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
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
            var staffId = await staffSqlRepository.AsQueryable(true)
                .Where(s => s.UserId == request.UserId)
                .Select(s => (int?)s.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (staffId == null)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var info = await appointmentSqlRepository.AsQueryable(true)
                .Where(a => a.Id == request.Id && a.StaffId == staffId.Value)
                .Select(a => new
                {
                    a.Id,
                    a.Status,
                    a.TimeStartService,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (info == null)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_BOOKING_NOT_FOUND, ErrorCodes.ERR_STAFF_BOOKING_NOT_FOUND);

            if (request.Status == AppointmentConst.STATUS_COMPLETED)
            {
                // Uncomment block ben duoi khi can bat check duration (demo thi de comment).

                //if (info.TimeStartService.HasValue)
                //{
                //    var durationMins = await appointmentSqlRepository.AsQueryable(true)
                //        .Where(a => a.Id == info.Id)
                //        .Select(a => a.Services!
                //            .Where(s => s.Status == AppointmentServiceConst.STATUS_ACTIVE)
                //            .Sum(s => s.DurationSnapshot * s.Quantity))
                //        .FirstOrDefaultAsync(cancellationToken);
                //    if (durationMins <= 0) durationMins = 15;

                //    var earliestCompleteAt = info.TimeStartService.Value.AddMinutes(durationMins);
                //    if (DateTimeHelper.UtcNow() < earliestCompleteAt)
                //    {
                //        return Result<object>.BadRequest(
                //            StaffConst.MSG_STAFF_COMPLETE_BEFORE_APPT_END,
                //            ErrorCodes.ERR_STAFF_COMPLETE_BEFORE_APPT_END);
                //    }
                //}
            }

            var appointment = await appointmentSqlRepository.FindByIdAsync(info.Id, false, cancellationToken);
            if (appointment == null)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_BOOKING_NOT_FOUND, ErrorCodes.ERR_STAFF_BOOKING_NOT_FOUND);

            if (request.Status == AppointmentConst.STATUS_IN_SERVICE
                && appointment.Status == AppointmentConst.STATUS_WAITING
                && appointment.TimeStartService == null)
            {
                appointment.TimeStartService = DateTimeHelper.UtcNow();
            }

            if (request.Status == AppointmentConst.STATUS_COMPLETED)
            {
                appointment.CompletedAt = DateTimeHelper.UtcNow();
            }

            appointment.Status = request.Status;
            if (request.Note != null)
            {
                appointment.Note = request.Note;
            }

            if (request.Status == AppointmentConst.STATUS_COMPLETED
                || request.Status == AppointmentConst.STATUS_CANCELLED
                || request.Status == AppointmentConst.STATUS_NO_SHOW)
            {
                await BookingPositionReleaseService.ReleasePositionIfNeededAsync(appointment, bookingPositionSqlRepository, cancellationToken);
            }

            appointmentSqlRepository.Update(appointment);
            await appointmentSqlRepository.SaveChangeAsync(cancellationToken);

            return Result<object>.Success("Cập nhật trạng thái thành công");
        }
    }
}
