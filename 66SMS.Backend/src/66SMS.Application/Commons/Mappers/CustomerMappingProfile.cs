using _66SMS.Application.DTOs.Customers;
using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Application.DTOs.MembershipTiers;
using _66SMS.Application.CustomerService.Customers.Commands.CreateCustomer;
using _66SMS.Application.CustomerService.Customers.Commands.UpdateCustomer;
using _66SMS.Application.CustomerService.MembershipCards.Commands.CreateMembershipCards;
using _66SMS.Application.CustomerService.MembershipCards.Commands.UpdateMembershipCards;
using _66SMS.Application.CustomerService.MembershipTiers.Commands.CreateMembershipTiers;
using _66SMS.Application.CustomerService.MembershipTiers.Commands.UpdateMembershipTiers;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Commons.Mappers
{
    public class CustomerMappingProfile : Profile
    {
        public CustomerMappingProfile()
        {
            // Create customer
            CreateMap<CreateCustomerCommand, User>()
                .IgnoreNullValueTypes();
            CreateMap<CreateCustomerCommand, Customer>()
                .IgnoreNullValueTypes();

            // Update customer
            CreateMap<UpdateCustomerCommand, Customer>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateCustomerCommand, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            // Customer DTO
            CreateMap<Customer, CustomerDTO>()
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth.ToDateOnlyString()))
                .ForMember(dest => dest.FirstPurchaseAt, opt => opt.MapFrom(src => src.FirstPurchaseAt.ToVietnamTimeString("dd/MM/yyyy HH:mm")))
                .ForMember(dest => dest.LastPurchaseAt, opt => opt.MapFrom(src => src.LastPurchaseAt.ToVietnamTimeString("dd/MM/yyyy HH:mm")))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .IgnoreNullValueTypes();

            // MembershipTier mappings
            CreateMap<CreateMembershipTierCommand, MembershipTier>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateMembershipTierCommand, MembershipTier>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<MembershipTier, MembershipTierDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
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
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .IgnoreNullValueTypes();
        }
    }
}
