using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.CreateRole
{
    public class CreateRoleHandler : IRequestHandler<CreateRoleCommand, Result<object>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IMapper mapper;
        public CreateRoleHandler(IRoleSqlRepository roleSqlRepository, IMapper mapper)
        {
            this.roleSqlRepository = roleSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
        {
            bool hasNameExsited = await roleSqlRepository.AnyAsync(x => x.Name.Equals(request.Name), cancellationToken);
            if (hasNameExsited) return Result<object>.BadRequest("Role name existed");
            Role? role = mapper.Map<Role>(request);
            role.Status = RoleConst.STATUS_ACTIVED;
            roleSqlRepository.Add(role);
            await roleSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Created(role);
                
        }
    }
}
