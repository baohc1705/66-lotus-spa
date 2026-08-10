using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Commands.CreateRole
{
    public class CreateRoleHandler : IRequestHandler<CreateRoleCommand, Result<int>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IMapper mapper;
        public CreateRoleHandler(IRoleSqlRepository roleSqlRepository, IMapper mapper)
        {
            this.roleSqlRepository = roleSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
        {
            bool hasNameExsited = await roleSqlRepository.AnyAsync(x => x.Name!.Equals(request.Name), cancellationToken);

            if (hasNameExsited) 
                return Result<int>.BadRequest(RoleConst.MSG_ROLE_NAME_EXISTED, ErrorCodes.ERR_ROLE_NAME_EXISTED);

            Role? role = mapper.Map<Role>(request);

            roleSqlRepository.Add(role);
            await roleSqlRepository.SaveChangeAsync(cancellationToken);

            return Result<int>.Created(role.Id);
        }
    }
}
