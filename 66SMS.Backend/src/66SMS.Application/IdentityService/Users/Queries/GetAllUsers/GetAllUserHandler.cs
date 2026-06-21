using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.IdentityService.Users.Queries.GetAllUsers
{
    /// <summary>
    /// Handler for <see cref="GetAllUserQuery"/>
    /// </summary>
    public class GetAllUserHandler : IRequestHandler<GetAllUserQuery, Result<PagedResult<UserFullDto>>>
    {
        private readonly IUserSqlRepository userSqlRepository;

        public GetAllUserHandler(IUserSqlRepository userSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
        }

        public async Task<Result<PagedResult<UserFullDto>>> Handle(GetAllUserQuery request, CancellationToken cancellationToken)
        {
            var query = userSqlRepository.AsQueryable();

            // Search keyword
            if (!string.IsNullOrEmpty(request.Filter))
                query = query.Where(x => x.Username.Contains(request.Filter) ||
                                    x.Email.Contains(request.Filter));

            // Order by
            query = request.OrderBy?.ToLower() switch
            {
                "email" => request.IsDescending ? query.OrderByDescending(x => x.Email) : query.OrderBy(x => x.Email),
                "createdat" => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
                _ => request.IsDescending ? query.OrderByDescending(x => x.Username) : query.OrderBy(x => x.Username)
            };

            // Projection trực tiếp xuống DTO, không cần Include
            var dtoQuery = query.Select(x => new UserFullDto
            {
                Id = x.Id,
                Username = x.Username,
                Email = x.Email,
                IsEmailConfirmed = x.IsEmailConfirmed,
                Status = x.Status.ToString(),
                LockoutEnd = x.LockoutEnd.HasValue ? x.LockoutEnd.Value.ToString("HH:mm:ss dd/MM/yyyy") : null,
                LastLoginAt = x.LastLoginAt.HasValue ? x.LastLoginAt.Value.ToString("HH:mm:ss dd/MM/yyyy") : null,
                Roles = x.UserRoles!.Select(ur => ur.Role!.Name).ToList(),
                Permissions = x.UserRoles!
                    .SelectMany(ur => ur.Role!.RolePermissions!.Select(rp => rp.Permission!.PermissionKey))
                    .Distinct()
                    .ToList(),
            });

            PagedResult<UserFullDto> pageDto = await dtoQuery.ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<UserFullDto>>.Success(pageDto);
        }
    }
}
