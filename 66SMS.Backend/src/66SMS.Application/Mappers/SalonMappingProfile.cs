using _66SMS.Application.DTOs.Staffs;
using _66SMS.Application.DTOs.StaffSalons;
using _66SMS.Application.SalonService.Salons.Commands.CreateSalon;
using _66SMS.Application.SalonService.Salons.Commands.UpdateSalon;
using _66SMS.Application.SalonService.Staffs.Commands.CreateStaff;
using _66SMS.Application.SalonService.Staffs.Commands.UpdateStaff;
using _66SMS.Application.SalonService.StaffSalons.Commands.CreateStaffSalon;
using _66SMS.Application.SalonService.StaffSalons.Commands.UpdateStaffSalon;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Entities;
using AutoMapper;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.Mappers
{
    public class SalonMappingProfile : Profile
    {
        public SalonMappingProfile()
        {
            // Create staff
            CreateMap<CreateStaffCommand, User>()
                .IgnoreNullValueTypes();
            CreateMap<CreateStaffCommand, Staff>()
                .IgnoreNullValueTypes();

            // Update staff
            CreateMap<UpdateStaffCommand, Staff>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateStaffCommand, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            // Staff DTO
            CreateMap<Staff, StaffDto>()
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth.ToDateOnlyString("dd/MM/yyyy")))
                .ForMember(dest => dest.HireDate, opt => opt.MapFrom(src => src.HireDate.ToDateOnlyString("dd/MM/yyyy")))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .IgnoreNullValueTypes();

            // StaffSalon
            CreateMap<CreateStaffSalonCommand, StaffSalon>().IgnoreNullValueTypes();
            CreateMap<UpdateStaffSalonCommand, StaffSalon>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.StaffId, opt => opt.Ignore())
                .ForMember(dest => dest.SalonId, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<StaffSalon, StaffSalonDto>()
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate.ToDateOnlyString("dd/MM/yyyy")))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate.ToDateOnlyString("dd/MM/yyyy")))
                .ForMember(dest => dest.SalonName, opt => opt.MapFrom(src => src.Salon != null ? src.Salon.Name : null))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt != null ? src.UpdatedAt.Value.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss") : null))
                .IgnoreNullValueTypes();

            // Salon
            CreateMap<CreateSalonCommand, Salon>().IgnoreNullValueTypes();
            CreateMap<UpdateSalonCommand, Salon>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
        }
    }
}
