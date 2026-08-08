using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.IdentityService.Permissions.Commands.DeletePermission
{
    /// <summary>
    /// Handler for <see cref="DeletePermissionCommand"/>
    /// </summary>
    public class DeletePermissionHandler : IRequestHandler<DeletePermissionCommand, Result<object>>
    {
        private readonly IPermissionSqlRepository permissionSqlRepository;

        public DeletePermissionHandler(IPermissionSqlRepository permissionSqlRepository)
        {
            this.permissionSqlRepository = permissionSqlRepository;
        }

        public async Task<Result<object>> Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
        {
            // Find permission with id
            var permission = await permissionSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            // Return not found if permission is null
            if (permission == null) 
                return Result<object>.NotFound(PermissionConst.MSG_PERMISSION_ID_NOT_FOUND, ErrorCodes.ERR_PERMISSION_NOT_FOUND);
            
            // Update status is deleted - soft delete
            permission.Status = PermissionConst.STATUS_DELETED;

            // Update and persist to database
            permissionSqlRepository.Update(permission);
            await permissionSqlRepository.SaveChangeAsync(cancellationToken);

            // Return success result
            return Result<object>.Ok();
        }
    }
}
