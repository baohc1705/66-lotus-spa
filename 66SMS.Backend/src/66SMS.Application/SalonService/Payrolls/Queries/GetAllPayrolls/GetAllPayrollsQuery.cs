using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Payrolls.Queries.GetAllPayrolls
{
    public class GetAllPayrollsQuery : PageRequest, IRequest<Result<PagedResult<PayrollDTO>>>
    {
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public int? Status { get; set; }
    }
}
