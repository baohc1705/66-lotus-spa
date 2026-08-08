using _66SMS.API.Abstractions;
using _66SMS.Application.DTOs;
using _66SMS.Application.SalonService.Revenues.Queries.ExportBranchRevenue;
using _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueByPeriod;
using _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueBySalon;
using _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueByService;
using _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueByStaff;
using _66SMS.Application.SalonService.Revenues.Queries.ExportRevenueBySalon;
using _66SMS.Application.SalonService.Revenues.Queries.GetCustomerTraffic;
using _66SMS.Application.SalonService.Revenues.Queries.GetNetRevenue;
using _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByPeriod;
using _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueBySalon;
using _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByService;
using _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueByStaff;
using _66SMS.Application.SalonService.Revenues.Queries.GetRevenueBreakdown;
using _66SMS.Application.SalonService.Revenues.Queries.GetRevenueSummary;
using _66SMS.Application.SalonService.Revenues.Queries.GetRevenueTrend;
using _66SMS.Application.SalonService.Revenues.Queries.GetTodaySummary;
using _66SMS.Application.SalonService.Revenues.Queries.GetTopRevenueItems;
using _66SMS.Application.SalonService.Revenues.Queries.GetTopStaff;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Constants;
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

        [HttpGet("export-by-salon")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> ExportBySalon(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] bool comparePrevious = true,
            CancellationToken cancellationToken = default)
        {
            var profile = jwtService.GetProfile();
            var isAdmin = profile?.Roles.Any(r =>string.Equals(r, RoleConst.CODE_ADMIN)) == true;

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

        [HttpGet("export-branch")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> ExportBranch(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            CancellationToken cancellationToken = default)
        {
            var profile = jwtService.GetProfile();
            var isAdmin = profile?.Roles.Any(r =>string.Equals(r, RoleConst.CODE_ADMIN)) == true;
            var tokenSalonId = jwtService.GetSalonId();

            if (!isAdmin && tokenSalonId > 0 && salonId > 0 && salonId != tokenSalonId)
                return HandleResult(Result<RevenueExportFileDto>.Forbidden(RevenueConst.MSG_SALON_FORBIDDEN));

            var finalSalonId = tokenSalonId ?? salonId;
            if (finalSalonId == null || finalSalonId <= 0)
                return HandleResult(Result<RevenueExportFileDto>.BadRequest(RevenueConst.MSG_SALON_REQUIRED));

            var result = await mediator.Send(new ExportBranchRevenueQuery
            {
                From = from,
                To = to,
                SalonId = finalSalonId.Value,
            }, cancellationToken);

            if (!result.IsSuccess || result.Data == null)
                return HandleResult(result);

            return File(result.Data.Content, result.Data.ContentType, result.Data.FileName);
        }

        [HttpGet("report/by-period")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetReportByPeriod(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] string grain = "day",
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetReportRevenueByPeriodQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                Grain = grain,
            }, cancellationToken);
            return HandleResult(result);
        }

        [HttpGet("report/by-salon")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetReportBySalon(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetReportRevenueBySalonQuery
            {
                From = from,
                To = to,
            }, cancellationToken);
            return HandleResult(result);
        }

        [HttpGet("report/by-staff")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetReportByStaff(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetReportRevenueByStaffQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
            }, cancellationToken);
            return HandleResult(result);
        }

        [HttpGet("report/by-service")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> GetReportByService(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] int? categoryId,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new GetReportRevenueByServiceQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                CategoryId = categoryId,
            }, cancellationToken);
            return HandleResult(result);
        }

        [HttpGet("report/export-by-period")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> ExportReportByPeriod(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] string grain = "day",
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new ExportReportRevenueByPeriodQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                Grain = grain,
            }, cancellationToken);

            if (!result.IsSuccess || result.Data == null)
                return HandleResult(result);

            return File(result.Data.Content, result.Data.ContentType, result.Data.FileName);
        }

        [HttpGet("report/export-by-salon")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> ExportReportBySalon(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new ExportReportRevenueBySalonQuery
            {
                From = from,
                To = to,
            }, cancellationToken);

            if (!result.IsSuccess || result.Data == null)
                return HandleResult(result);

            return File(result.Data.Content, result.Data.ContentType, result.Data.FileName);
        }

        [HttpGet("report/export-by-staff")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> ExportReportByStaff(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new ExportReportRevenueByStaffQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
            }, cancellationToken);

            if (!result.IsSuccess || result.Data == null)
                return HandleResult(result);

            return File(result.Data.Content, result.Data.ContentType, result.Data.FileName);
        }

        [HttpGet("report/export-by-service")]
        [PermissionAuthorize("revenue", "read")]
        public async Task<IActionResult> ExportReportByService(
            [FromQuery] DateOnly from,
            [FromQuery] DateOnly to,
            [FromQuery] int? salonId,
            [FromQuery] int? categoryId,
            CancellationToken cancellationToken = default)
        {
            var result = await mediator.Send(new ExportReportRevenueByServiceQuery
            {
                From = from,
                To = to,
                SalonId = salonId,
                CategoryId = categoryId,
            }, cancellationToken);

            if (!result.IsSuccess || result.Data == null)
                return HandleResult(result);

            return File(result.Data.Content, result.Data.ContentType, result.Data.FileName);
        }
    }
}
