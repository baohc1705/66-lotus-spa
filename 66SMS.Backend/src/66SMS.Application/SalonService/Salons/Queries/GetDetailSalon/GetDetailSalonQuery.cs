using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.SalonService.Salons.Queries.GetDetailSalon
{
    /// <summary>
    /// Get detail salon
    /// </summary>
    public class GetDetailSalonQuery : IRequest<Result<SalonDto>>
    {
        public int? Id { get; set; }
    }
}
