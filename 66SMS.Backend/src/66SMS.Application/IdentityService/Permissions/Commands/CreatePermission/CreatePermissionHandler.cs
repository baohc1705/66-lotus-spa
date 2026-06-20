using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Permissions.Commands.CreatePermission
{
    public class CreatePermissionHandler : IRequestHandler<CreatePermissionCommand, Result<object>>
    {
        private readonly IPermissionSqlRepository permissionSqlRepository;
        private readonly IMapper mapper;
        public CreatePermissionHandler(IPermissionSqlRepository permissionSqlRepository, IMapper mapper)
        {
            this.permissionSqlRepository = permissionSqlRepository;
            this.mapper = mapper;
        }
        public async Task<Result<object>> Handle(CreatePermissionCommand request, CancellationToken cancellationToken)
        {
            bool permissionNameExsited = await permissionSqlRepository.AsQueryable().Where(x => x.Name.Equals(request.Name)).AnyAsync(cancellationToken);
            if (permissionNameExsited)
                return Result<object>.BadRequest(PermissionConst.MSG_PERMISSION_NAME_EXISTED, ErrorCodes.ERR_PERMISSION_NAME_EXISTED);

            Permission? permission = mapper.Map<Permission>(request);
            permission.Status = PermissionConst.STATUS_ACTIVED;
            permissionSqlRepository.Add(permission);
            await permissionSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Created(permission);
        }
    }
}
