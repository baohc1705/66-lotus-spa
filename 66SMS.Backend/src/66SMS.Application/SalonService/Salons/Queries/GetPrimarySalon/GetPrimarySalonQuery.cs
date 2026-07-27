using _66SMS.Application.DTOs;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Salons.Queries.GetPrimarySalon
{
    public class GetPrimarySalonQuery : IRequest<Result<SalonDto?>>
    {
    }
}
