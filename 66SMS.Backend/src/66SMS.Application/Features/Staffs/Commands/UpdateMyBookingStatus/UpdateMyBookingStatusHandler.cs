using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Staffs.Commands.UpdateMyBookingStatus
{
    public sealed class UpdateMyBookingStatusHandler : IRequestHandler<UpdateMyBookingStatusCommand, Result<object>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public UpdateMyBookingStatusHandler(
            IStaffSqlRepository staffSqlRepository,
            IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<object>> Handle(UpdateMyBookingStatusCommand request, CancellationToken cancellationToken)
        {
            var staff = await staffSqlRepository.AsQueryable()
                .FirstOrDefaultAsync(s => s.UserId == request.UserId, cancellationToken);
            
            if (staff == null)
                return Result<object>.NotFound("Không tìm thấy nhân viên.");

            var appointment = await appointmentSqlRepository.AsQueryable(false)
                .FirstOrDefaultAsync(a => a.Id == request.Id && a.StaffId == staff.Id, cancellationToken);

            if (appointment == null)
                return Result<object>.NotFound("Lịch hẹn không tồn tại hoặc không thuộc về nhân viên này.");

            appointment.Status = request.Status;
            if (request.Note != null)
            {
                appointment.Note = request.Note;
            }

            appointmentSqlRepository.Update(appointment);
            await appointmentSqlRepository.SaveChangeAsync(cancellationToken);

            return Result<object>.Success("Cập nhật trạng thái thành công");
        }
    }
}
