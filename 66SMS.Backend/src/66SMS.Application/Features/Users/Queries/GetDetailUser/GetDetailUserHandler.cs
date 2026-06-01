using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Users.Queries.GetDetailUser
{
    public class GetDetailUserHandler : IRequestHandler<GetDetailUserQuery, Result<UserDto>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IMapper mapper;

        public GetDetailUserHandler(IUserSqlRepository userSqlRepository, IMapper mapper)
        {
            this.userSqlRepository = userSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<UserDto>> Handle(GetDetailUserQuery request, CancellationToken cancellationToken)
        {
            var query = userSqlRepository.Query();

            // Search keyword
            query = query.Where(x => x.Id == request.Id);

            //Include
            query = query.Include(x => x
            .Include(ur => ur.UserRoles)
                .ThenInclude(ur => ur.Role.RolePermissions)
                    .ThenInclude(rp => rp.Permission));
            User user = await query.FirstOrDefaultAsync(cancellationToken);

            if (user == null)
                return Result<UserDto>.NotFound("User not found");
            UserDto userDto = mapper.Map<UserDto>(user);
            userDto.Roles = user.UserRoles.Select(x => x.Role.Name).ToList();
            userDto.Permissions = user.UserRoles.SelectMany(x => x.Role.RolePermissions.Select(p => p.Permission.PermissionKey)).ToList();

            return Result<UserDto>.Success(userDto);
        }
    }
}
