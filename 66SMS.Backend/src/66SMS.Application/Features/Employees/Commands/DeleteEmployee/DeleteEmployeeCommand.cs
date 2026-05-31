using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Employees.Commands.DeleteEmployee
{
    public class DeleteEmployeeCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
    }
}
