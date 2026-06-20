using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Auth.Commands.UpdatePermission
{
    public class UpdatePermissionHandler : IRequestHandler<UpdatePermissionCommand, Result<object>>
    {
        private readonly IPermissionSqlRepository permissionSqlRepository;

        public UpdatePermissionHandler(IPermissionSqlRepository permissionSqlRepository)
        {
            this.permissionSqlRepository = permissionSqlRepository;
        }

        public async Task<Result<object>> Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
        {
            var permission = await permissionSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            if (permission == null) return Result<object>.NotFound(PermissionConst.MSG_PERMISSION_ID_NOT_FOUND, ErrorCodes.ERR_PERMISSION_NOT_FOUND);

            bool nameExisted = await permissionSqlRepository.AsQueryable()
                .Where(x => x.Name.Equals(request.Name) && x.Id != request.Id)
                .AnyAsync(cancellationToken);
            if (nameExisted) return Result<object>.BadRequest(PermissionConst.MSG_PERMISSION_NAME_EXISTED, ErrorCodes.ERR_PERMISSION_NAME_EXISTED);

            permission.Name = request.Name;
            permission.Resource = request.Resource;
            permission.Action = request.Action;
            permission.Description = request.Description;
            permissionSqlRepository.Update(permission);
            await permissionSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
