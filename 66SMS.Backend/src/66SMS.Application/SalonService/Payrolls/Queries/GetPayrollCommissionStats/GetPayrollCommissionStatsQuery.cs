using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Payrolls.Queries.GetPayrollCommissionStats
{
    public class GetPayrollCommissionStatsQuery : IRequest<Result<PayrollCommissionStatsDto>>
    {
        public int? StaffId { get; set; }
        public DateOnly FromDate { get; set; }
        public DateOnly ToDate { get; set; }
        public int UserId { get; set; }
        public bool IsAdmin { get; set; }
    }
}
