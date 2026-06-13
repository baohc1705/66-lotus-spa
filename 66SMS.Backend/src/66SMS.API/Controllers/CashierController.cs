using _66SMS.API.Abstractions;
using _66SMS.Application.Features.Cashier.Queries.GetCashierDaily;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class CashierController : ApiController<CashierController>
    {
        private readonly IMediator mediator;

        public CashierController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet("daily")]
        [Authorize]
        public async Task<IActionResult> GetDaily([FromQuery] DateOnly date)
        {
            var query = new GetCashierDailyQuery { Date = date };
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpGet("online-bookings")]
        [Authorize]
        public IActionResult GetOnlineBookings()
        {
            // Stub
            return Ok(new { IsSuccess = true, Data = new object[] {} });
        }

        [HttpPut("bookings/{id}/status")]
        [Authorize]
        public IActionResult UpdateBookingStatus(int id, [FromBody] object request)
        {
            // Stub
            return Ok(new { IsSuccess = true, Message = "Cập nhật trạng thái thành công" });
        }

        [HttpPost("bookings/{id}/pay")]
        [Authorize]
        public IActionResult PayBooking(int id, [FromBody] object request)
        {
            // Stub
            return Ok(new { IsSuccess = true, Message = "Thanh toán thành công" });
        }

        [HttpGet("vnpay/create-url/{bookingId}")]
        [Authorize]
        public IActionResult CreateVnPayUrl(int bookingId)
        {
            // Stub
            return Ok(new { IsSuccess = true, Data = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html" });
        }

        [HttpGet("vnpay-return")]
        [AllowAnonymous]
        public IActionResult VnPayReturn()
        {
            // Stub
            return Ok(new { IsSuccess = true, Message = "Giao dịch VNPay thành công" });
        }
    }
}
