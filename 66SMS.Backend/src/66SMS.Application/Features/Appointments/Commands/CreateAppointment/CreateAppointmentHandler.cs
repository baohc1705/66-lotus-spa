using _66SMS.Application.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentHandler : IRequestHandler<CreateAppointmentCommand, Result<List<int>>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IBookingAvailabilityService bookingAvailabilityService;
        private readonly IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateAppointmentHandler(IAppointmentSqlRepository appointmentSqlRepository, IServiceSqlRepository serviceSqlRepository, IBookingAvailabilityService bookingAvailabilityService, IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
            this.bookingAvailabilityService = bookingAvailabilityService;
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        /// <summary>
        /// Xử lý logic tạo mới danh sách lịch hẹn vào cơ sở dữ liệu.
        /// </summary>
        public async Task<Result<List<int>>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var appointmentIds = new List<int>();

                foreach (var guest in request.Guests)
                {
                    var mainServiceId = guest.Services?.FirstOrDefault()?.ServiceId ?? 0;
                    if (mainServiceId == 0) return Result<List<int>>.BadRequest("Phải chọn ít nhất 1 dịch vụ cho mỗi khách.");

                    int staffId = 0;
                    int? scheduleId = null;
                    AppointmentSlotLock? validLock = null;

                    // Kiểm tra Khóa (Lock) trước tiên
                    if (guest.LockId.HasValue)
                    {
                        validLock = await appointmentSlotLockSqlRepository.FindByIdAsync(guest.LockId.Value);
                        if (validLock == null ||
                            validLock.Status != AppointmentSlotLockConst.STATUS_ACTIVE ||
                            validLock.ExpiresAt <= DateTime.UtcNow)
                        {
                            return Result<List<int>>.BadRequest("Khóa giữ chỗ không hợp lệ hoặc đã hết thời gian (10 phút). Vui lòng tải lại trang.");
                        }

                        // Nếu Lock hợp lệ -> Bỏ qua thuật toán tìm Staff, dùng luôn thông tin đã chốt trong Lock
                        staffId = validLock.StaffId;
                    }
                    else
                    {
                        // Nếu không có Lock (Flow đặt trực tiếp), chạy check rảnh rỗi realtime
                        var resolvedStaff = await bookingAvailabilityService.ResolveStaffAsync(
                            (DateOnly)guest.AppointmentDate,
                            mainServiceId,
                            guest.StaffId,
                            (int)guest.SlotId,
                            cancellationToken);

                        if (resolvedStaff == null)
                        {
                            return Result<List<int>>.Conflict("Khung giờ này đã kín lịch hoặc nhân viên bạn chọn không còn trống lịch.");
                        }
                        staffId = resolvedStaff.Value.StaffId;
                        scheduleId = resolvedStaff.Value.ScheduleId;
                    }

                    // Tính toán giá và tạo danh sách Service đi kèm
                    var appointmentServices = new List<AppointmentService>();
                    decimal totalAmount = 0;

                    foreach (var reqService in guest.Services)
                    {
                        var serviceEntity = await serviceSqlRepository
                            .AsQueryable()
                            .Where(x => x.Id == reqService.ServiceId)
                            .FirstOrDefaultAsync(cancellationToken);
                        if (serviceEntity == null) continue;

                        appointmentServices.Add(new AppointmentService
                        {
                            ServiceId = serviceEntity.Id,
                            PriceSnapshot = serviceEntity.SellingPrice,
                            DurationSnapshot = serviceEntity.DurationMins,
                            Quantity = (int)reqService.Quantity,
                            Status = AppointmentServiceConst.STATUS_ACTIVE // Active
                        });
                        totalAmount += serviceEntity.SellingPrice * (int)reqService.Quantity;
                    }

                    // Tạo record Appointment
                    var appointment = new Appointment
                    {
                        AppointmentCode = $"APT-{DateTime.UtcNow:yyyyMMddHHmmss}-{new Random().Next(100, 999)}",
                        CreatedByUserId = (int)request.CreatedByUserId,
                        StaffId = staffId,
                        ScheduleId = scheduleId,
                        SlotId = (int)(validLock != null ? validLock.SlotId : guest.SlotId),
                        PositionId = (int)(validLock != null ? validLock.PositionId : guest.PositionId),
                        LockId = validLock?.Id,
                        AppointmentDate = (DateOnly)guest.AppointmentDate,
                        Status = AppointmentConst.STATUS_PENDING,
                        Note = guest.Note,
                        TotalAmount = totalAmount,
                        PaidAmount = 0,
                        Services = appointmentServices,
                        CreatedAt = DateTime.UtcNow
                    };

                    appointmentSqlRepository.Add(appointment);
                    await appointmentSqlRepository.SaveChangeAsync(cancellationToken);
                    appointmentIds.Add(appointment.Id);

                    // Cập nhật trạng thái Lock thành "Released" (đã dùng thành công)
                    if (validLock != null)
                    {
                        validLock.Status = AppointmentSlotLockConst.STATUS_RELEASED;
                        validLock.ReleasedAt = DateTime.UtcNow;
                        validLock.Appointment = appointment;
                        appointmentSlotLockSqlRepository.Update(validLock);
                        await appointmentSlotLockSqlRepository.SaveChangeAsync(cancellationToken);
                    }
                }

                transaction.Commit();
                return Result<List<int>>.Created(appointmentIds);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
