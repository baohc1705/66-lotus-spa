using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Auth.Queries.GetAllRoles
{
    public class GetAllRoleHandler : IRequestHandler<GetAllRoleQuery, Result<List<RoleDTO>>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;

        public GetAllRoleHandler(IRoleSqlRepository roleSqlRepository)
        {
            this.roleSqlRepository = roleSqlRepository;
        }

        public async Task<Result<List<RoleDTO>>> Handle(GetAllRoleQuery request, CancellationToken cancellationToken)
        {
            // Kiem tra co include gi khong
            var query = roleSqlRepository.AsQueryable().AsQueryable();
            if (request.Include != null && request.Include.Count() > 0)
            {
                foreach (string item in request.Include)
                {
                    query = item.ToLower() switch
                    {
                        "roleusers" => query.Include(x => x.UserRoles).ThenInclude(r => r.User),
                        "rolepermissions" => query.Include(x => x.RolePermissions).ThenInclude(p => p.Permission),
                        _ => query
                    };
                }
            }
            else
            {
                query = query.Include(ur => ur.UserRoles).ThenInclude(r => r.User)
                             .Include(rp => rp.RolePermissions).ThenInclude(p => p.Permission);
            }

            var roles = await query.ToListAsync(cancellationToken);
            var roleDtos = roles.Select(x => new RoleDTO
            {
                Id = x.Id,
                Name = x.Name,
                Desctiption = x.Description,
                Status = x.Status.ToString(),
                RoleUsers = x.UserRoles?.Select(x => new RoleUserDTO
                {
                    Id = x.Id,
                    Username = x.User.Username
                }).ToList() ?? null,
                RolePermissions = x.RolePermissions?.Select(x => new RolePermissionDTO
                {
                    Id = x.Id,
                    Name = x.Permission.Name,
                }).ToList() ?? null,
            }).ToList();

            return Result<List<RoleDTO>>.Success(roleDtos);
        }
    }
}
