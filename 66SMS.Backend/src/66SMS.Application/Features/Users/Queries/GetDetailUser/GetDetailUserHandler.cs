using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

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
            User? user = await userSqlRepository.Query().Where(x => x.Id == request.Id).FirstOrDefaultAsync(cancellationToken);
            if (user == null)
                return Result<UserDto>.NotFound("User not found");
            return Result<UserDto>.Success(mapper.Map<UserDto>(user));
        }
    }
}
