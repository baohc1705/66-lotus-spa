using _66SMS.API.Abstractions;
using _66SMS.Application.SalonService.Revenues.Queries.ExportRevenueBySalon;
using _66SMS.Application.SalonService.Revenues.Queries.GetCustomerTraffic;
using _66SMS.Application.SalonService.Revenues.Queries.GetNetRevenue;
using _66SMS.Application.SalonService.Revenues.Queries.GetRevenueBreakdown;
using _66SMS.Application.SalonService.Revenues.Queries.GetRevenueSummary;
using _66SMS.Application.SalonService.Revenues.Queries.GetRevenueTrend;
using _66SMS.Application.SalonService.Revenues.Queries.GetTodaySummary;
using _66SMS.Application.SalonService.Revenues.Queries.GetTopRevenueItems;
using _66SMS.Application.SalonService.Revenues.Queries.GetTopStaff;
using _66SMS.Contracts.Abstractions;
using _66SMS.Infrastructure.Security;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace _66SMS.API.Controllers
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/admin/revenue")]
    public class AdminRevenueController : ApiController<AdminRevenueController>
    {
        private readonly IMediator mediator;
        private readonly IJwtService jwtService;

        public AdminRevenueController(IMediator mediator, IJwtService jwtService)
        {
            this.mediator = mediator;
            this.jwtService = jwtService;
        }

        [HttpGet("summary")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] bool comparePrevious = true,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetRevenueSummaryQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                ComparePrevious = comparePrevious,
            }, cancellationToken);

            return HandleResult(result);
        }

        [HttpGet("trend")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetTrend(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetRevenueTrendQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
            }, cancellationToken);

            return HandleResult(result);
        }

        [HttpGet("breakdown")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetBreakdown(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetRevenueBreakdownQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
            }, cancellationToken);

            return HandleResult(result);
        }

        [HttpGet("top-items")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetTopItems(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] string type = "service",
            [FromQuery] int limit = 5,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetTopRevenueItemsQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                Type = type,
                Limit = limit,
            }, cancellationToken);

            return HandleResult(result);
        }

        [HttpGet("today")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetToday(
            [FromQuery] int? salonId,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetTodaySummaryQuery
            {
                SalonId = salonId,
            }, cancellationToken);

            return HandleResult(result);
        }

        [HttpGet("customer-traffic")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetCustomerTraffic(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] string tab = "hour",
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetCustomerTrafficQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                Tab = tab,
            }, cancellationToken);

            return HandleResult(result);
        }

        [HttpGet("net-revenue")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetNetRevenue(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] string tab = "hour",
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetNetRevenueQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                Tab = tab,
            }, cancellationToken);

            return HandleResult(result);
        }

        [HttpGet("top-staff")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetTopStaff(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] int limit = 5,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetTopStaffQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                Limit = limit,
            }, cancellationToken);

            return HandleResult(result);
        }

        /// <summary>
        /// Xuất Excel so sánh doanh thu tất cả chi nhánh (chỉ Admin).
        /// </summary>
        [HttpGet("export-by-salon")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> ExportBySalon(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] bool comparePrevious = true,
            CancellationToken cancellationToken = default)
        {
            var profile = jwtService.GetProfile();
            var isAdmin = profile?.Roles.Any(r =>
                string.Equals(r, "Admin", StringComparison.OrdinalIgnoreCase)) == true;

            var result = await mediator.Send(new ExportRevenueBySalonQuery
            {
                From = from,
                To = to,
                ComparePrevious = comparePrevious,
                IsAdmin = isAdmin,
            }, cancellationToken);

            if (!result.IsSuccess || result.Data == null)
                return HandleResult(result);

            return File(result.Data.Content, result.Data.ContentType, result.Data.FileName);
        }
    }
}
