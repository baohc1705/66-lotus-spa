using _66SMS.Application.DTOs.StaffSalons;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.StaffSalons.Queries.GetDetailStaffSalon
{
    public class GetDetailStaffSalonQuery : IRequest<Result<StaffSalonDto>>
    {
        public int Id { get; set; }
    }
}
