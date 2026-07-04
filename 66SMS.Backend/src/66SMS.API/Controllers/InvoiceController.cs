using _66SMS.API.Abstractions;
using _66SMS.Application.BookingService.Invoices.Commands.CancelInvoice;
using _66SMS.Application.BookingService.Invoices.Commands.CreateInvoice;
using _66SMS.Application.BookingService.Invoices.Commands.CreateInvoiceFromAppointment;
using _66SMS.Application.BookingService.Invoices.Commands.PayInvoice;
using _66SMS.Application.BookingService.Invoices.Queries.GetAllInvoices;
using _66SMS.Application.BookingService.Invoices.Queries.GetDetailInvoice;
using _66SMS.Application.BookingService.Invoices.Queries.GetInvoicePreviewFromAppointment;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    public class InvoiceController : ApiController<InvoiceController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public InvoiceController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpPost]
        [PermissionAuthorize("invoices", "create")]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceCommand command)
        {
            var userId = jwtService.GetUserId();
            command.CashierId = userId;
            command.CreatedBy = userId;

            // Manager/thu ngân: ghi đè salon_id từ token. Admin: dùng salonId trong body (nếu có).
            var tokenSalonId = jwtService.GetClaim<int?>("salon_id");
            if (tokenSalonId.HasValue)
            {
                command.SalonId = tokenSalonId.Value;
            }

            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPatch("{id}/cancel")]
        [PermissionAuthorize("invoices", "update")]
        public async Task<IActionResult> CancelInvoice(int id)
        {
            var command = new CancelInvoiceCommand { Id = id, UpdatedBy = jwtService.GetUserId() };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("admin")]
        [PermissionAuthorize("invoices", "read")]
        public async Task<IActionResult> AdminGetAll([FromQuery] GetAllInvoicesQuery query)
        {
            var result = await mediator.Send(query);
            return HandleResult(result);
        }

        [HttpPost("from-appointment/{appointmentId}")]
        [PermissionAuthorize("invoices", "create")]
        public async Task<IActionResult> CreateFromAppointment(int appointmentId)
        {
            var command = new CreateInvoiceFromAppointmentCommand
            {
                AppointmentId = appointmentId,
                CashierId = jwtService.GetUserId(),
                CreatedBy = jwtService.GetUserId()
            };
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("{id}/pay")]
        [PermissionAuthorize("invoices", "update")]
        public async Task<IActionResult> PayInvoice(int id, [FromBody] PayInvoiceCommand command)
        {
            command.Id = id;
            command.CashierId = jwtService.GetUserId();
            var result = await mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("from-appointment/{appointmentId}/preview")]
        [PermissionAuthorize("invoices", "read")]
        public async Task<IActionResult> GetPreviewFromAppointment(int appointmentId)
        {
            var result = await mediator.Send(new GetInvoicePreviewFromAppointmentQuery { AppointmentId = appointmentId });
            return HandleResult(result);
        }

        [HttpGet("{id}")]
        [PermissionAuthorize("invoices", "read")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var result = await mediator.Send(new GetDetailInvoiceQuery { Id = id });
            return HandleResult(result);
        }
    }
}
