using _66SMS.Application.DTOs.Users;
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
            var query = userSqlRepository.Query();

            // Search keyword
            if (!string.IsNullOrEmpty(request.SearchKeyword))
                query = query.Where(x => x.Username.Contains(request.SearchKeyword) ||
                                    x.Email.Contains(request.SearchKeyword));
            // Order by
            query = request.OrderBy?.ToLower() switch
            {
                "email" => query.OrderBy(x => x.Email, request.IsDescending),
                "createdat" => query.OrderBy(x => x.CreatedAt, request.IsDescending),
                _ => query.OrderBy(x => x.Username, request.IsDescending)
            };

            //Include
            query = query.Include(x => x
            .Include(ur => ur.UserRoles)
                .ThenInclude(ur => ur.Role.RolePermissions)
                    .ThenInclude(rp => rp.Permission));

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
                    LogoutEnd = x.LogoutEnd.ToVietnamTimeString(),
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
