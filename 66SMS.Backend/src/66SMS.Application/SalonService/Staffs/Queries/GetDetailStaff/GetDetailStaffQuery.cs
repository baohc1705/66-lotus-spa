using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetDetailStaff
{
    public record GetDetailStaffQuery : IRequest<Result<StaffFullDto>>
    {
        public int? Id { get; set; }
        public int? SalonId { get; set; }
    }
}
