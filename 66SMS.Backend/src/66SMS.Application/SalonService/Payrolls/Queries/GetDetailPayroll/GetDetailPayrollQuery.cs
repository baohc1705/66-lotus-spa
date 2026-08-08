using _66SMS.Application.DTOs.Payrolls;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Payrolls.Queries.GetDetailPayroll
{
    public class GetDetailPayrollQuery : IRequest<Result<PayrollDTO>>
    {
        public int Id { get; set; }
    }
}
