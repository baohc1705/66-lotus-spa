using _66SMS.Application.BookingService.Promotions.Commands.CreatePromotion;
using _66SMS.Application.BookingService.Promotions.Commands.UpdatePromotion;
using _66SMS.Application.DTOs;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Mappers
{
    public class PromotionMappingProfile : Profile
    {
        public PromotionMappingProfile()
        {
            CreateMap<CreatePromotionCommand, Promotion>().IgnoreNullValueTypes();
            CreateMap<UpdatePromotionCommand, Promotion>()
                .ForMember(d => d.Id, o => o.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<Promotion, PromotionDto>().IgnoreNullValueTypes();
        }
    }
}
