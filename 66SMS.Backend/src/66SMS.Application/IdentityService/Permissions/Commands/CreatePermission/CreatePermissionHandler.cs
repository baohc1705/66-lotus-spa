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
    /// <summary>
    /// Handler for <see cref="CreatePermissionCommand"/>
    /// </summary>
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
            // Check permision with name, name is unique
            bool permissionNameExsited = await permissionSqlRepository
                .AsQueryable()
                .Where(x => x.Name.Equals(request.Name))
                .AnyAsync(cancellationToken);

            // Return bad request if permission name existed
            if (permissionNameExsited)
                return Result<object>.BadRequest(PermissionConst.MSG_PERMISSION_NAME_EXISTED, ErrorCodes.ERR_PERMISSION_NAME_EXISTED);

            // Map request to domain entity
            Permission? permission = mapper.Map<Permission>(request);

            // Save and persist to database
            permissionSqlRepository.Add(permission);
            await permissionSqlRepository.SaveChangeAsync(cancellationToken);

            // Return created
            return Result<object>.Created(permission);
        }
    }
}
