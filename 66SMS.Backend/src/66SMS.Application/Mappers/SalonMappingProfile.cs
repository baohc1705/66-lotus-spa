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

            // Staff DTO (projection dùng trong query; map giữ cho chỗ còn dùng mapper)
            CreateMap<Staff, StaffDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src =>
                    src.User != null && src.User.UserRoles != null
                        ? src.User.UserRoles.Select(ur => ur.Role != null ? ur.Role.Code : null).FirstOrDefault()
                        : null))
                .IgnoreNullValueTypes();
            CreateMap<Staff, StaffFullDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src =>
                    src.User != null && src.User.UserRoles != null
                        ? src.User.UserRoles.Select(ur => ur.Role != null ? ur.Role.Code : null).FirstOrDefault()
                        : null))
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
