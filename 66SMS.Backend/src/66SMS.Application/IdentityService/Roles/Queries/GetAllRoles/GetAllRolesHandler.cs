using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Roles.Queries.GetAllRoles
{
    public class GetAllRolesHandler : IRequestHandler<GetAllRoleQuery, Result<List<RoleDTO>>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;

        public GetAllRolesHandler(IRoleSqlRepository roleSqlRepository)
        {
            this.roleSqlRepository = roleSqlRepository;
        }

        public async Task<Result<List<RoleDTO>>> Handle(GetAllRoleQuery request, CancellationToken cancellationToken)
        {
            var hasIncludeFilter = request.Include != null && request.Include.Count > 0;
            var includeUsers = !hasIncludeFilter
                || request.Include!.Any(i => i.Equals("roleusers", StringComparison.OrdinalIgnoreCase));
            var includePermissions = !hasIncludeFilter
                || request.Include!.Any(i => i.Equals("rolepermissions", StringComparison.OrdinalIgnoreCase));

            var roles = await roleSqlRepository.AsQueryable()
                .Select(x => new RoleDTO
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name!,
                    Desctiption = x.Description!,
                    Status = x.Status.ToString(),
                    RoleUsers = includeUsers
                        ? x.UserRoles!
                            .Select(ur => new RoleUserDTO
                            {
                                Id = ur.Id,
                                Username = ur.User!.Username,
                            })
                            .ToList()
                        : null,
                    RolePermissions = includePermissions
                        ? x.RolePermissions!
                            .Select(rp => new RolePermissionDTO
                            {
                                Id = rp.Id,
                                PermissionId = rp.PermissionId,
                                Name = rp.Permission!.Name,
                            })
                            .ToList()
                        : null,
                })
                .ToListAsync(cancellationToken);

            return Result<List<RoleDTO>>.Success(roles);
        }
    }
}
