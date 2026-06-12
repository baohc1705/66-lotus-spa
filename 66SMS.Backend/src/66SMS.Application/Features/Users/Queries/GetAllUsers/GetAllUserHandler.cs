using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Users.Queries.GetAllUsers
{
    public class GetAllUserHandler : IRequestHandler<GetAllUserQuery, Result<PagedResult<UserDto>>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IMapper mapper;

        public GetAllUserHandler(IUserSqlRepository userSqlRepository, IMapper mapper)
        {
            this.userSqlRepository = userSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<UserDto>>> Handle(GetAllUserQuery request, CancellationToken cancellationToken)
        {
            var query = userSqlRepository.AsQueryable();
            //Include
            query = query.Include(ur => ur.UserRoles)
                            .ThenInclude(ur => ur.Role.RolePermissions)
                                .ThenInclude(rp => rp.Permission);

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

            

            PagedResult<User>? paged = await query.ToPagedAsync(request, cancellationToken);
            PagedResult<UserDto> pageDto = new PagedResult<UserDto>
            {
                Items = paged.Items.Select(x => new UserDto
                {
                    Id = x.Id,
                    Username = x.Username,
                    Email = x.Email,
                    IsEmailConfirmed = x.IsEmailConfirmed,
                    Status = x.Status.ToString(),
                    LockoutEnd = x.LockoutEnd.ToVietnamTimeString(),
                    LastLoginAt = x.LastLoginAt.ToVietnamTimeString(),
                    Roles = x.UserRoles.Select(x => x.Role.Name).ToList(),
                    Permissions = x.UserRoles.SelectMany(x => x.Role.RolePermissions.Select(x => x.Permission.PermissionKey)).ToList(),
                }).ToList(),
                PageIndex = paged.PageIndex,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
            };
           
            return Result<PagedResult<UserDto>>.Success(pageDto);
        }
    }
}
