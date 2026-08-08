using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Commands.DeleteRole
{
    /// <summary>
    /// Handler for <see cref="DeleteRoleCommand"/>
    /// </summary>
    public class DeleteRoleHandler : IRequestHandler<DeleteRoleCommand, Result<object>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;

        public DeleteRoleHandler(IRoleSqlRepository roleSqlRepository)
        {
            this.roleSqlRepository = roleSqlRepository;
        }

        public async Task<Result<object>> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        {
            // Find role by id and tracking
            var role = await roleSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            
            // return not found if role is null
            if (role == null) 
                return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

            // update status is deleted - soft delete
            role.Status = RoleConst.STATUS_DELETED;

            // update and persist to database
            roleSqlRepository.Update(role);
            await roleSqlRepository.SaveChangeAsync(cancellationToken);

            // return to success result
            return Result<object>.Ok();
        }
    }
}
