using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Appointments.Commands.CreateAppointment;
using _66SMS.Application.BookingService.Appointments.Commands.CreateSlotLock;
using _66SMS.Application.BookingService.Appointments.Commands.PayDepositWithWallet;
using _66SMS.Application.BookingService.Appointments.Commands.PostponeAppointment;
using _66SMS.Application.BookingService.Appointments.Queries.GetAllAppointment;
using _66SMS.Application.BookingService.Appointments.Queries.GetDepositVnPayUrl;
using _66SMS.Application.BookingService.Appointments.Queries.GetTechnicians;
using _66SMS.Application.BookingService.Appointments.Queries.GetTimeSlots;
using _66SMS.Contracts.Abstractions;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{

    [ApiVersion("1.0")]
    public class AppointmentController : ApiController<AppointmentController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public AppointmentController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        /// <summary>
        /// Lấy danh sách nhân viên (thợ) khả dụng cho một dịch vụ vào một ngày cụ thể.
        /// </summary>
        /// <param name="date">Ngày muốn đặt lịch (YYYY-MM-DD).</param>
        /// <param name="serviceId">ID của dịch vụ muốn đặt.</param>
        /// <returns>Danh sách nhân viên khả dụng.</returns>
        [HttpGet("technicians")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTechnicians([FromQuery] DateOnly date, [FromQuery] int serviceId, [FromQuery] int? salonId = null)
        {
            GetTechniciansQuery query = new()
            {
                Date = date,
                ServiceId = serviceId,
                SalonId = salonId
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        /// <summary>
        /// Lấy danh sách các khung giờ trống cho một dịch vụ (và nhân viên nếu có) vào một ngày cụ thể.
        /// </summary>
        /// <param name="date">Ngày muốn đặt lịch.</param>
        /// <param name="serviceId">ID của dịch vụ.</param>
        /// <param name="technicianId">ID của nhân viên (tùy chọn). Nếu không truyền sẽ lấy khung giờ trống của tất cả nhân viên.</param>
        /// <returns>Danh sách khung giờ trống.</returns>
        [HttpGet("timeslots")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTimeSlots([FromQuery] DateOnly date, [FromQuery] int serviceId, [FromQuery] int? technicianId, [FromQuery] int? salonId = null)
        {
            GetTimeSlotsQuery query = new()
            {
                Date = date,
                ServiceId = serviceId,
                StaffId = technicianId,
                SalonId = salonId
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        /// <summary>
        /// Khóa (giữ chỗ) một khung giờ trong thời gian ngắn (ví dụ: 10 phút) để tiến hành đặt lịch, tránh khách khác đặt trùng.
        /// </summary>
        /// <param name="command">Thông tin yêu cầu giữ chỗ (SlotId, PositionId...).</param>
        /// <returns>Thông tin khóa giữ chỗ (LockId) để dùng khi tạo lịch hẹn chính thức.</returns>
        [HttpPost("lock")]
        [Authorize]
        public async Task<IActionResult> CreateSlotLock([FromBody] List<SlotLockDto> locks)
        {
            var command = new CreateSlotLockCommand
            {
                Locks = locks,
                LockedByUserId = jwtService.GetUserId()
            };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        /// <summary>
        /// Tạo mới danh sách lịch hẹn.
        /// </summary>
        /// <param name="guests">Danh sách chi tiết lịch hẹn của từng khách.</param>
        /// <returns>Danh sách ID của các lịch hẹn vừa tạo.</returns>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateAppointment([FromBody] List<GuestAppointmentDto> guests)
        {
            var command = new CreateAppointmentCommand
            {
                Guests = guests,
                CreatedByUserId = jwtService.GetUserId()
            };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        /// <summary>
        /// Lấy danh sách lịch hẹn của khách hàng đang đăng nhập.
        /// </summary>
        /// <returns>Danh sách lịch hẹn cá nhân.</returns>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyAppointment()
        {
            GetAllAppointmentQuery query = new()
            {
                UserId = jwtService.GetUserId()
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllAppointment([FromQuery] GetAllAppointmentQuery query)
        {
            var tokenSalonId = jwtService.GetClaim<int?>("salon_id");
            if (tokenSalonId.HasValue)
                query.SalonId = tokenSalonId.Value;
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        /// <summary>
        /// Tạo URL VNPAY đặt cọc sau khi đặt lịch online.
        /// </summary>
        /// <param name="id">ID của lịch hẹn</param>
        /// <returns>URL VNPAY</returns>
        [HttpGet("{id}/deposit-vnpay-url")]
        [Authorize]
        public async Task<IActionResult> GetDepositVnPayUrl(int id)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.MapToIPv4()?.ToString() ?? "127.0.0.1";
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "0.0.0.0") ipAddress = "127.0.0.1";
            var query = new GetDepositVnPayUrlQuery
            {
                AppointmentId = id,
                IpAddress = ipAddress
            };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        /// <summary>
        /// Thanh toán tiền cọc bằng số dư Ví (Wallet).
        /// </summary>
        /// <param name="id">ID của lịch hẹn</param>
        [HttpPost("{id}/pay-deposit-wallet")]
        [Authorize]
        public async Task<IActionResult> PayDepositWithWallet(int id)
        {
            var command = new PayDepositWithWalletCommand
            {
                AppointmentId = id,
                UserId = jwtService.GetUserId()
            };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        /// <summary>
        /// Hoãn lịch hẹn và hoàn tiền cọc vào ví.
        /// </summary>
        /// <param name="id">ID của lịch hẹn</param>
        [HttpPost("{id}/postpone")]
        [Authorize]
        public async Task<IActionResult> PostponeAppointment(int id)
        {
            var command = new PostponeAppointmentCommand
            {
                AppointmentId = id,
                UserId = jwtService.GetUserId()
            };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }
    }
}
