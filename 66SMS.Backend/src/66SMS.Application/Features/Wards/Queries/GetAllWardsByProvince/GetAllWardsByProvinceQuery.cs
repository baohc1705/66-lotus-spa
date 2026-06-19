using _66SMS.Application.DTOs.Wards;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Wards.Queries.GetAllWardsByProvince
{
    public class GetAllWardsByProvinceQuery : IRequest<Result<List<WardDto>>>
    {
        public string ProvinceCode { get; set; } = string.Empty;
    }
}
