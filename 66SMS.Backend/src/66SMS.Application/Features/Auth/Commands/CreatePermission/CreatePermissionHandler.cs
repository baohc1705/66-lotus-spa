using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.CreatePermission
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
            bool permissionNameExsited = await permissionSqlRepository.Query().Where(x => x.Name.Equals(request.Name)).AnyAsync(cancellationToken);
            if (permissionNameExsited)
                return Result<object>.BadRequest("Permission name exsited");

            Permission? permission = mapper.Map<Permission>(request);
            permission.Status = PermissionStatus.ACTIVE;
            permissionSqlRepository.Add(permission);
            await permissionSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Created(permission);
        }
    }
}
