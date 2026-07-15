using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Commands.CreateRole
{
    /// <summary>
    /// Handler for <see cref="CreateRoleCommand"/>
    /// </summary>
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
            // Check if name exsisted
            bool hasNameExsited = await roleSqlRepository.AnyAsync(x => x.Name!.Equals(request.Name), cancellationToken);
            
            // return if name existed
            if (hasNameExsited) 
                return Result<int>.BadRequest(RoleConst.MSG_ROLE_NAME_EXISTED, ErrorCodes.ERR_ROLE_NAME_EXISTED);

            // Map request to role entity
            Role? role = mapper.Map<Role>(request);

            // add and persist to database
            roleSqlRepository.Add(role);
            await roleSqlRepository.SaveChangeAsync(cancellationToken);

            // return id of entity
            return Result<int>.Created(role.Id);
        }
    }
}
