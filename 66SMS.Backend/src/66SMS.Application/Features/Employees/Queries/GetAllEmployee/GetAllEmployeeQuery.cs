using _66SMS.Application.DTOs.Employees;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Employees.Queries.GetAllEmployee
{
    public class GetAllEmployeeQuery : PageRequest, IRequest<Result<PagedResult<EmployeeDTO>>>
    {
    }
}
