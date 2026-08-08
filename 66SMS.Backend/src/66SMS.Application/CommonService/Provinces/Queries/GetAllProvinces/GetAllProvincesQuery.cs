using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CommonService.Provinces.Queries.GetAllProvinces
{
    public class GetAllProvincesQuery : IRequest<Result<List<ProvinceDto>>>
    {
    }
}
