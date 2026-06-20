using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.IdentityService.Auth.Commands.Registers
{
    /// <summary>
    /// Handler for  <see cref="RegisterCommand"/>
    /// </summary>
    public class RegisterHandler : IRequestHandler<RegisterCommand, Result<RegisterResponseDto>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IMapper mapper;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IPasswordHash passwordHash;

        public RegisterHandler(IUserSqlRepository userSqlRepository, IRoleSqlRepository roleSqlRepository, IMapper mapper, ISqlUnitOfWork sqlUnitOfWork, IPasswordHash passwordHash)
        {
            this.userSqlRepository = userSqlRepository;
            this.roleSqlRepository = roleSqlRepository;
            this.mapper = mapper;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.passwordHash = passwordHash;
        }

        public async Task<Result<RegisterResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            // Check email and username if existed
            bool emailOrUsernameExisted = await userSqlRepository
                .AsQueryable()
                .Where(x => x.Username == request.UserName || x.Email == request.Email)
                .AnyAsync(cancellationToken);

            if (emailOrUsernameExisted)
            {
                return Result<RegisterResponseDto>.Conflict(UserConst.MSG_USER_ALREADY_EXISTS, ErrorCodes.ERR_USER_ALREADY_EXISTS);
            }

            // Fetch customer role
            var role = await roleSqlRepository
                .AsQueryable()
                .Where(x => x.Name.Equals("customer"))
                .FirstOrDefaultAsync(cancellationToken);

            if (role == null)
            {
                return Result<RegisterResponseDto>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);
            }

            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Create user entity
                User user = mapper.Map<User>(request);
                user.PasswordHash = passwordHash.Hash(request.Password!);

                // Create and link customer
                var customer = new Customer
                {
                    FullName = request.FullName!,
                    Phone = request.Phone!
                };
                user.Customer = customer;

                // Create and link wallet to customer
                var wallet = new Wallet
                {
                    Balance = 0,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTime.UtcNow
                };
                customer.Wallet = wallet;

                // Create and link user role
                var userRole = new UserRole
                {
                    RoleId = role.Id
                };
                user.UserRoles = new List<UserRole> { userRole };

                // Persist all entities in single transaction
                // EF Core will automatically:
                // 1. Insert User -> populate user.Id
                // 2. Insert Customer with user.Id -> populate customer.Id
                // 3. Insert Wallet with customer.Id
                // 4. Insert UserRole with user.Id
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                // Trả về cả userId và customerId để frontend có thể tạo membership card ngay sau đăng ký
                return Result<RegisterResponseDto>.Created(new RegisterResponseDto
                {
                    UserId = user.Id,
                    CustomerId = customer.Id
                });
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
