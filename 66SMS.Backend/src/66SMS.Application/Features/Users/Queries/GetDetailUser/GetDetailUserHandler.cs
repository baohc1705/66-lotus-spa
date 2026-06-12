using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Users.Queries.GetDetailUser
{
    public class GetDetailUserHandler : IRequestHandler<GetDetailUserQuery, Result<UserDto>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;

        public GetDetailUserHandler(IUserSqlRepository userSqlRepository, IUserRoleSqlRepository userRoleSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
        }

        public async Task<Result<UserDto>> Handle(GetDetailUserQuery request, CancellationToken cancellationToken)
        {
            User? user = await userSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
                return Result<UserDto>.NotFound("User not found");

            Role? role = await userRoleSqlRepository.GetRoleByUserIdAsync(user.Id, cancellationToken);
            List<string>? permissions = role == null
                ? []
                : await userRoleSqlRepository.GetPermissionKeysByUserIdAndRoleIdAsync(user.Id, role.Id, cancellationToken);

            UserDto userDto = new()
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                IsEmailConfirmed = user.IsEmailConfirmed,
                Status = user.Status.ToString(),
                LockoutEnd = user.LockoutEnd.ToVietnamTimeString(),
                LastLoginAt = user.LastLoginAt.ToVietnamTimeString(),
                Roles = role == null ? [] : [role.Name],
                Permissions = permissions ?? [],
            };

            return Result<UserDto>.Success(userDto);
        }
    }
}
