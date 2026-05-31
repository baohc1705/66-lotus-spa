using _66SMS.Application.DTOs.Employees;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Employees.Queries.GetDetailEmployee
{
    public record GetDetailEmployeeQuery : IRequest<Result<EmployeeDTO>>
    {
        public int? Id { get; set; }
    }
}
