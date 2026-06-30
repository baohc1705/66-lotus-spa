using _66SMS.Application.DTOs.Users;
using _66SMS.Application.IdentityService.Users.Commands.UpdateUser;
using _66SMS.Application.IdentityService.Permissions.Commands.CreatePermission;
using _66SMS.Application.IdentityService.Roles.Commands.CreateRole;
using _66SMS.Application.IdentityService.Auth.Commands.Registers;
using _66SMS.Domain.Entities;
using AutoMapper;
using _66SMS.Application.IdentityService.Permissions.Commands.UpdatePermission;
using _66SMS.Application.IdentityService.Roles.Commands.UpdateRole;
using _66SMS.Application.IdentityService.Users.Commands.DeleteUser;

namespace _66SMS.Application.Mappers
{
    public class IdentityMappingProfile : Profile
    {
        public IdentityMappingProfile()
        {
            #region Auths

            CreateMap<RegisterCommand, User>()
               .IgnoreNullValueTypes();

            CreateMap<RegisterCommand, Customer>()
               .IgnoreNullValueTypes();

            #endregion
            
            #region Users

            CreateMap<User, UserFullDto>();

            CreateMap<UpdateUserCommand, User>()
               .IgnoreNullValueTypes();

            CreateMap<DeleteUserCommand, User>()
               .IgnoreNullValueTypes();

            #endregion

            #region Permissions

            CreateMap<CreatePermissionCommand, Permission>()
                .IgnoreNullValueTypes();
            CreateMap<UpdatePermissionCommand, Permission>()
                .IgnoreNullValueTypes();

            #endregion

            #region Roles

            CreateMap<CreateRoleCommand, Role>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateRoleCommand, Role>()
                .IgnoreNullValueTypes();

            #endregion
        }
    }
}
