using MediatR;
using _66SMS.Contracts.Shared;

namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaffServices;

public class DeleteStaffServiceCommand : IRequest<Result<object>>
{
    public List<int>? Ids { get; set; }
}
