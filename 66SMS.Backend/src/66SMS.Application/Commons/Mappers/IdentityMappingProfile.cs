using _66SMS.Application.DTOs.Users;
using _66SMS.Application.IdentityService.Users.Commands.UpdateUser;
using _66SMS.Application.IdentityService.Permissions.Commands.CreatePermission;
using _66SMS.Application.IdentityService.Roles.Commands.CreateRole;
using _66SMS.Application.IdentityService.Auth.Commands.Registers;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Commons.Mappers
{
    public class IdentityMappingProfile : Profile
    {
        public IdentityMappingProfile()
        {
            // Update user
            CreateMap<UpdateUserCommand, User>()
                .IgnoreNullValueTypes();

            CreateMap<User, UserDto>();

            // Create permission
            CreateMap<CreatePermissionCommand, Permission>();

            // Create role
            CreateMap<CreateRoleCommand, Role>();

            // Register
            CreateMap<RegisterCommand, User>()
                .IgnoreNullValueTypes();
            CreateMap<RegisterCommand, Customer>()
               .IgnoreNullValueTypes();
        }
    }
}
