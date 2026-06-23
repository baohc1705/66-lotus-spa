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
                // 1. Create user entity
                User user = mapper.Map<User>(request);
                user.PasswordHash = passwordHash.Hash(request.Password!);

                // Thêm User vào CSDL trước để lấy Id (An toàn với Transaction)
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // 2. Create and link customer
                var customer = new Customer
                {
                    UserId = user.Id, // Gán cứng UserId vừa sinh ra
                    FullName = request.FullName!,
                    Phone = request.Phone!,
                    Source =  "Online",
                    CreatedBy = user.Id,
                    Status = request.Status ?? CustomerConst.STATUS_ACTIVED // Tự set active nếu không có status
                };
                user.Customer = customer;

                // 3. Create and link wallet to customer
                var wallet = new Wallet
                {
                    Balance = 0,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = user.Id
                };
                customer.Wallet = wallet;

                // 4. Create and link user role
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = role.Id
                };
                user.UserRoles = new List<UserRole> { userRole };

                // 5. Persist relations
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
