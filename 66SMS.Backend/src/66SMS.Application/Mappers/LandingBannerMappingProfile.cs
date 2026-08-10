using _66SMS.Application.CmsService.LandingBanners.Commands.CreateLandingBanner;
using _66SMS.Application.CmsService.LandingBanners.Commands.UpdateLandingBanner;
using _66SMS.Application.DTOs;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Mappers
{
    public class LandingBannerMappingProfile : Profile
    {
        public LandingBannerMappingProfile()
        {
            CreateMap<CreateLandingBannerCommand, LandingBanner>().IgnoreNullValueTypes();
            CreateMap<UpdateLandingBannerCommand, LandingBanner>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<LandingBanner, LandingBannerDto>().IgnoreNullValueTypes();
        }
    }
}
