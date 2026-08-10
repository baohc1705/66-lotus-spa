using _66SMS.Application.DTOs;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Mappers
{
    public class CommonMappingProfile : Profile
    {
        public CommonMappingProfile()
        {
            CreateMap<Province, ProvinceDto>()
                .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Id));

            CreateMap<Ward, WardDto>()
                .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Id));
        }
    }
}
