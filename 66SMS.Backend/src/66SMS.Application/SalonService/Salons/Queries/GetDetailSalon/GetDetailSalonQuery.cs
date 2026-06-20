using _66SMS.Application.DTOs.Salons;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Salons.Queries.GetDetailSalon
{
    public class GetDetailSalonQuery : IRequest<Result<SalonDto>>
    {
        public int Id { get; set; }
    }
}
