using _66SMS.Contract.Abstractions;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CustomerService.Customers.Commands.CreateCustomer
{
    /// <summary>
    /// Handler for <see cref="CreateCustomerCommand"/>
    /// </summary>
    public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, Result<object>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;
        private readonly IPasswordHash passwordHash;

        public CreateCustomerHandler(
            ICustomerSqlRepository customerSqlRepository,
            IUserSqlRepository userSqlRepository,
            IRoleSqlRepository roleSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService,
            IPasswordHash passwordHash)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.roleSqlRepository = roleSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
            this.passwordHash = passwordHash;
        }

        public async Task<Result<object>> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.AvatarUrl = null;

            var phone = request.Phone!.Trim();
            var email = request.Email!.Trim();

            var userExisted = await userSqlRepository.AsQueryable(true)
                .AnyAsync(u => u.Username == phone || u.Email == email, cancellationToken);
            if (userExisted)
                return Result<object>.Conflict(UserConst.MSG_USER_ALREADY_EXISTS, ErrorCodes.ERR_USER_ALREADY_EXISTS);

            var roleId = await roleSqlRepository.AsQueryable(true)
                .Where(x => x.Code == RoleConst.CODE_CUSTOMER && x.Status == RoleConst.STATUS_ACTIVED)
                .Select(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);
            if (roleId == 0)
                return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

            Customer? customer = mapper.Map<Customer>(request);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var user = new User
                {
                    Username = phone,
                    Email = email,
                    PasswordHash = passwordHash.Hash(phone),
                    IsEmailConfirmed = true,
                    Status = (int)StatusActiveEnum.ACTIVED,
                    CreatedAt = DateTimeHelper.UtcNow(),
                    CreatedBy = request.CreatedBy,
                    UserRoles = new List<UserRole>
                    {
                        new UserRole
                        {
                            RoleId = roleId,
                            AssignedAt = DateTimeHelper.UtcNow(),
                            AssignedBy = request.CreatedBy,
                        }
                    }
                };

                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                customer.UserId = user.Id;
                customer.Wallet = new Wallet
                {
                    CustomerId = customer.Id,
                    Balance = 0,
                    Status = WalletConst.STATUS_ACTIVE,
                    CreatedAt = DateTimeHelper.UtcNow()
                };

                customerSqlRepository.Add(customer);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    customer.AvatarUrl = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        CustomerConst.GenerateImageFileName(customer.Id),
                        CustomerConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(customer.AvatarUrl))
                    {
                        customerSqlRepository.Update(customer);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

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
