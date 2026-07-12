using _66SMS.Application.CustomerService.Customers.Commands.CreateCustomer;
using _66SMS.Application.CustomerService.Customers.Commands.UpdateCustomer;
using _66SMS.Application.CustomerService.MembershipCards.Commands.CreateMembershipCards;
using _66SMS.Application.CustomerService.MembershipCards.Commands.UpdateMembershipCards;
using _66SMS.Application.CustomerService.MembershipTiers.Commands.CreateMembershipTiers;
using _66SMS.Application.CustomerService.MembershipTiers.Commands.UpdateMembershipTiers;
using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Application.DTOs.MembershipTiers;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Mappers
{
    public class CustomerMappingProfile : Profile
    {
        public CustomerMappingProfile()
        {
            #region Customers
            CreateMap<CreateCustomerCommand, Customer>().IgnoreNullValueTypes();
            CreateMap<UpdateCustomerCommand, Customer>().IgnoreNullValueTypes();
            #endregion

            // MembershipTier mappings
            CreateMap<CreateMembershipTierCommand, MembershipTier>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateMembershipTierCommand, MembershipTier>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<MembershipTier, MembershipTierDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => (string?)null))
                .IgnoreNullValueTypes();

            // MembershipCard mappings
            CreateMap<CreateMembershipCardCommand, MembershipCard>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateMembershipCardCommand, MembershipCard>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<MembershipCard, MembershipCardDto>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : null))
                .ForMember(dest => dest.TierName, opt => opt.MapFrom(src => src.Tier != null ? src.Tier.Name : null))
                .ForMember(dest => dest.IssuedAt, opt => opt.MapFrom(src => src.IssuedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.ExpiresAt, opt => opt.MapFrom(src => src.ExpiresAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.IssuedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .IgnoreNullValueTypes();
        }
    }
}
