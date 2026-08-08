using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Permissions.Commands.UpdatePermission
{
    /// <summary>
    /// Handler for <see cref="UpdatePermissionCommand"/>
    /// </summary>
    public class UpdatePermissionHandler : IRequestHandler<UpdatePermissionCommand, Result<object>>
    {
        private readonly IPermissionSqlRepository permissionSqlRepository;
        private readonly IMapper mapper;

        public UpdatePermissionHandler(IPermissionSqlRepository permissionSqlRepository, IMapper mapper)
        {
            this.permissionSqlRepository = permissionSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
        {
            // Find permission with id
            var permission = await permissionSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            //  Return not found if permission is null
            if (permission == null) return Result<object>.NotFound(PermissionConst.MSG_PERMISSION_ID_NOT_FOUND, ErrorCodes.ERR_PERMISSION_NOT_FOUND);

            // Check name if existed
            bool nameExisted = await permissionSqlRepository.AsQueryable()
                .Where(x => x.Name.Equals(request.Name) && x.Id != request.Id)
                .AnyAsync(cancellationToken);
            if (nameExisted) return Result<object>.BadRequest(PermissionConst.MSG_PERMISSION_NAME_EXISTED, ErrorCodes.ERR_PERMISSION_NAME_EXISTED);

            // Map request to domain entity and ignore null
            mapper.Map(request, permission);
            
            // Update and persist to database
            permissionSqlRepository.Update(permission);
            await permissionSqlRepository.SaveChangeAsync(cancellationToken);

            // Return success result
            return Result<object>.Ok();
        }
    }
}
