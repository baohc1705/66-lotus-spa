using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Exceptions;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Users.Commands.CreateUser
{
    public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IPasswordHash passwordHash;
        public CreateUserHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper, IPasswordHash passwordHash, IUserRoleSqlRepository userRoleSqlRepository, IRoleSqlRepository roleSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.roleSqlRepository = roleSqlRepository;
        }
        public async Task<Result<object>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            // Check exsited username, email
            var userExisted = await userSqlRepository.AsQueryable()
                .Where(x => x.Username.Equals(request.UserName) || x.Email.Equals(request.Email))
                .AnyAsync();
            if (userExisted)
                return Result<object>.BadRequest("Username or email existed");

            User? user = mapper.Map<User>(request);

            using var transaction = await userSqlRepository.BeginTransactionAsync(cancellationToken);
            try
            {
                // Hash password save in db
                user.PasswordHash = passwordHash.Hash(request.Password);

                user.CreatedAt = DateTime.UtcNow;
                user.CreatedBy = request.CreatedBy;
                user.Status = _66SMS.Domain.Constants.UserConst.STATUS_ACTIVED;

                // Save user and get user id
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Check if request has role for user
                if (!string.IsNullOrEmpty(request.Role))
                {
                    // Check and assign user to role
                    var role = await roleSqlRepository.AsQueryable()
                        .Where(x => x.Name.Equals(request.Role))
                        .FirstOrDefaultAsync(cancellationToken);
                    if (role == null) return Result<object>.BadRequest("Role not found");
                    var userRole = new UserRole
                    {
                        UserId = user.Id,
                        RoleId = role.Id,
                        AssignedAt = DateTime.UtcNow,
                        AssignedBy = request.CreatedBy ?? 1,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = request.CreatedBy ?? 1
                    };
                    userRoleSqlRepository.Add(userRole);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                }

               
                transaction.Commit();

                return Result<object>.Ok();
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw new TransactionRollBackException(typeof(CreateUserCommand).Name, ex.Message);
            }
        }
    }
}
