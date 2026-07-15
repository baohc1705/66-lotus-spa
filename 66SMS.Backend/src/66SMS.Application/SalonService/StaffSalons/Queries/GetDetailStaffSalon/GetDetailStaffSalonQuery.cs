using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.SalonService.StaffSalons.Queries.GetDetailStaffSalon
{
    public class GetDetailStaffSalonQuery : IRequest<Result<StaffSalonDto>>
    {
        public int? Id { get; set; }
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
    }
}
