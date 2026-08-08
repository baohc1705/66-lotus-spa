using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.IdentityService.Permissions.Commands.DeletePermission
{
    public class DeletePermissionHandler : IRequestHandler<DeletePermissionCommand, Result<object>>
    {
        private readonly IPermissionSqlRepository permissionSqlRepository;

        public DeletePermissionHandler(IPermissionSqlRepository permissionSqlRepository)
        {
            this.permissionSqlRepository = permissionSqlRepository;
        }

        public async Task<Result<object>> Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
        {
            var permission = await permissionSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            if (permission == null) 
                return Result<object>.NotFound(PermissionConst.MSG_PERMISSION_ID_NOT_FOUND, ErrorCodes.ERR_PERMISSION_NOT_FOUND);

            permission.Status = PermissionConst.STATUS_DELETED;

            permissionSqlRepository.Update(permission);
            await permissionSqlRepository.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
