using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Messages;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Messages;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Staffs.Commands.UpdateMyBookingStatus
{
    public sealed class UpdateMyBookingStatusHandler : IRequestHandler<UpdateMyBookingStatusCommand, Result<object>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IBookingPositionSqlRepository bookingPositionSqlRepository;
        private readonly IDomainEventPublisher domainEventPublisher;

        public UpdateMyBookingStatusHandler(
            IStaffSqlRepository staffSqlRepository,
            IAppointmentSqlRepository appointmentSqlRepository,
            IBookingPositionSqlRepository bookingPositionSqlRepository,
            IDomainEventPublisher domainEventPublisher)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.bookingPositionSqlRepository = bookingPositionSqlRepository;
            this.domainEventPublisher = domainEventPublisher;
        }

        public async Task<Result<object>> Handle(UpdateMyBookingStatusCommand request, CancellationToken cancellationToken)
        {
            var staffRow = await staffSqlRepository.AsQueryable(true)
                .Where(s => s.UserId == request.UserId)
                .Select(s => new { s.Id, s.FullName })
                .FirstOrDefaultAsync(cancellationToken);

            if (staffRow == null)
                return Result<object>.NotFound(StaffConst.MSG_STAFF_NOT_FOUND, ErrorCodes.ERR_STAFF_NOT_FOUND);

            var info = await appointmentSqlRepository.AsQueryable(true)
                .Where(a => a.Id == request.Id && a.StaffId == staffRow.Id)
                .Select(a => new
                {
                    a.Id,
                    a.Status,
                    a.TimeStartService,
                    CustomerName = a.CreatedByUser!.Customer != null
                        ? a.CreatedByUser.Customer.FullName
                        : a.CreatedByUser!.Username,
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

            var at = DateTimeHelper.UtcNow().ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm dd/MM/yyyy");
            var statusLabel = StatusLabel(appointment.Status);
            var actorName = staffRow.FullName;
            var customerName = info.CustomerName;
            var staffMessage = $"{actorName} vừa cập nhật lịch hẹn #{appointment.Id} của khách {customerName} sang \"{statusLabel}\" vào lúc {at}.";
            var customerMessage = $"{actorName} vừa cập nhật lịch hẹn #{appointment.Id} của bạn sang \"{statusLabel}\" vào lúc {at}.";

            await domainEventPublisher.PublishAsync(new SendNotificationEvent<BookingNotificationPayload>
            {
                Domain = NotificationConst.DOMAIN_BOOKING,
                EventType = NotificationConst.EVENT_APPOINTMENT_STATUS_CHANGED,
                Title = "Cập nhật lịch hẹn",
                Message = staffMessage,
                Payload = new BookingNotificationPayload
                {
                    CustomerMessage = customerMessage,
                    SalonId = appointment.SalonId,
                    CustomerUserId = appointment.CreatedByUserId,
                    StaffUserId = request.UserId,
                    AppointmentId = appointment.Id,
                    StaffId = appointment.StaffId,
                    Status = appointment.Status,
                    CustomerName = customerName,
                    AppointmentDate = appointment.AppointmentDate,
                },
            }, cancellationToken);

            return Result<object>.Success("Cập nhật trạng thái thành công");
        }

        private static string StatusLabel(int status) => status switch
        {
            AppointmentConst.STATUS_PENDING => "chờ xác nhận",
            AppointmentConst.STATUS_CONFIRMED => "đã xác nhận",
            AppointmentConst.STATUS_WAITING => "chờ phục vụ",
            AppointmentConst.STATUS_IN_SERVICE => "đang phục vụ",
            AppointmentConst.STATUS_COMPLETED => "hoàn thành",
            AppointmentConst.STATUS_CANCELLED => "đã hủy",
            AppointmentConst.STATUS_NO_SHOW => "khách không đến",
            _ => $"trạng thái {status}",
        };
    }
}
