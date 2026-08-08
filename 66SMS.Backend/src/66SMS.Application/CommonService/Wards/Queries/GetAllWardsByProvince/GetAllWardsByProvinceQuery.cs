using _66SMS.Application.DTOs.Wards;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CommonService.Wards.Queries.GetAllWardsByProvince
{
    public class GetAllWardsByProvinceQuery : IRequest<Result<List<WardDto>>>
    {
        public string ProvinceCode { get; set; } = string.Empty;
    }
}
