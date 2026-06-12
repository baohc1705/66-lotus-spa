using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.Features.Customers.Commands.CreateCustomer
{
    public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IPasswordHash passwordHash;

        public CreateCustomerHandler(IUserSqlRepository userSqlRepository, ICustomerSqlRepository customerSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper, IPasswordHash passwordHash, IRoleSqlRepository roleSqlRepository, IUserRoleSqlRepository userRoleSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
            this.roleSqlRepository = roleSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
        }

        public async Task<Result<object>> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
        {
            // Kiem tra trung email va username
            bool emailOrUsernameExisted = await userSqlRepository.AsQueryable()
                .Where(x => x.Email.Equals(request.Email) || x.Username.Equals(request.UserName))
                .AnyAsync();
            if (emailOrUsernameExisted)
                return Result<object>.Conflict("Email or username existed", ErrorCodes.ERR_USER_ALREADY_EXISTS);

            User? user = mapper.Map<User>(request);
            user.PasswordHash = passwordHash.Hash(request.Password!);
            user.CreatedAt = DateTime.UtcNow;
            user.CreatedBy = request.CreatedBy ?? 1;
            user.Status = UserConst.STATUS_ACTIVED;

            Customer? customer = mapper.Map<Customer>(request);
            customer.CreatedAt = DateTime.UtcNow;
            customer.CreatedBy = request.CreatedBy ?? 1;
            customer.Status = CustomerConst.STATUS_ACTIVED;
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // save user first
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // save customer
                customer.UserId = user.Id;
                customerSqlRepository.Add(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Save role
                string roleRequest = request.Role ?? "customer";
                Role? role = await roleSqlRepository.AsQueryable()
                    .Where(x => x.Name.Equals(roleRequest))
                    .FirstOrDefaultAsync(cancellationToken);
                if (role == null)
                    return Result<object>.BadRequest("Invalid role", ErrorCodes.ERR_BAD_REQUEST);
                UserRole userRole = new ()
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

                transaction.Commit();
                return Result<object>.Created(customer.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
