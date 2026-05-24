using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Users.Queries.GetAllUsers
{
    public class GetAllUserHandler : IRequestHandler<GetAllUserQuery, Result<PagedResult<User>>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IMapper mapper;

        public GetAllUserHandler(IUserSqlRepository userSqlRepository, IMapper mapper)
        {
            this.userSqlRepository = userSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<User>>> Handle(GetAllUserQuery request, CancellationToken cancellationToken)
        {
            var users = await userSqlRepository.GetPagedIncludeAsync(
                pageIndex: request.PageIndex,
                pageSize: request.PageSize,
                predicate: x => !x.IsDeleted,
                orderBy: x =>x.CreatedAt,
                isDescending: false,
                include: x => x
                    .Include(ur => ur.UserRoles)
                        .ThenInclude(ur => ur.Role.RolePermissions)
                            .ThenInclude(rp => rp.Permission),
                ct: cancellationToken);
            //var usersDto = mapper.Map<PagedResult<UserDto>>(users);
            return Result<PagedResult<User>>.Success(users);
        }
    }
}
