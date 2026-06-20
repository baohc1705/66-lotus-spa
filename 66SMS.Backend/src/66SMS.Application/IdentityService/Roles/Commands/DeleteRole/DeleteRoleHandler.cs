using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Commands.DeleteRole
{
    public class DeleteRoleHandler : IRequestHandler<DeleteRoleCommand, Result<object>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;

        public DeleteRoleHandler(IRoleSqlRepository roleSqlRepository)
        {
            this.roleSqlRepository = roleSqlRepository;
        }

        public async Task<Result<object>> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        {
            var role = await roleSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            if (role == null) return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

            role.Status = RoleConst.STATUS_DELETED;
            roleSqlRepository.Update(role);
            await roleSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
