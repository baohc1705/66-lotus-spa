using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Staffs.Queries.GetDetailStaff
{
    public record GetDetailStaffQuery : IRequest<Result<StaffDto>>
    {
        public int? Id { get; set; }
    }
}
