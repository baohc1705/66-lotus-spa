using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Commands.UpdateRole
{
    public class UpdateRoleHandler : IRequestHandler<UpdateRoleCommand, Result<object>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;

        public UpdateRoleHandler(IRoleSqlRepository roleSqlRepository)
        {
            this.roleSqlRepository = roleSqlRepository;
        }

        public async Task<Result<object>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
        {
            var role = await roleSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);
            if (role == null) return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

            bool nameExisted = await roleSqlRepository.AnyAsync(
                x => x.Name!.Equals(request.Name) && x.Id != request.Id, cancellationToken);
            if (nameExisted) return Result<object>.BadRequest(RoleConst.MSG_ROLE_NAME_EXISTED, ErrorCodes.ERR_ROLE_NAME_EXISTED);

            role.Name = request.Name;
            role.Description = request.Description;
            roleSqlRepository.Update(role);
            await roleSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
