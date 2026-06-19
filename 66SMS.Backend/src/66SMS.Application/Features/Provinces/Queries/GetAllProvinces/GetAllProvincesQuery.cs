using _66SMS.Application.DTOs.Provinces;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Provinces.Queries.GetAllProvinces
{
    public class GetAllProvincesQuery : IRequest<Result<List<ProvinceDto>>>
    {
    }
}
