using _66SMS.Application.DTOs.Auth;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Messages;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using _66SMS.Domain.Messages;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.IdentityService.Auth.Commands.Registers
{
    /// <summary>
    /// Handler for  <see cref="RegisterCommand"/>
    /// </summary>
    public class RegisterHandler : IRequestHandler<RegisterCommand, Result<int>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IMapper mapper;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IPasswordHash passwordHash;
        private readonly IDomainEventPublisher domainEventPublisher;
        private readonly IEmailTemplateFactory emailTemplateFactory;

        public RegisterHandler(IUserSqlRepository userSqlRepository,
                                IRoleSqlRepository roleSqlRepository,
                                IMapper mapper,
                                ISqlUnitOfWork sqlUnitOfWork,
                                IPasswordHash passwordHash,
                                IDomainEventPublisher domainEventPublisher,
                                IEmailTemplateFactory emailTemplateFactory)
        {
            this.userSqlRepository = userSqlRepository;
            this.roleSqlRepository = roleSqlRepository;
            this.mapper = mapper;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.passwordHash = passwordHash;
            this.domainEventPublisher = domainEventPublisher;
            this.emailTemplateFactory = emailTemplateFactory;
        }

        public async Task<Result<int>> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra email và username đã tồn tại chưa
            bool emailOrUsernameExisted = await userSqlRepository
                .AsQueryable(true)
                .Where(x => x.Username == request.UserName || x.Email == request.Email)
                .AnyAsync(cancellationToken);

            // Nếu email hoặc username đã tồn tại, trả về lỗi
            if (emailOrUsernameExisted)
            {
                return Result<int>.Conflict(UserConst.MSG_USER_ALREADY_EXISTS, ErrorCodes.ERR_USER_ALREADY_EXISTS);
            }

            // Lấy role customer theo code (schema: roles.code)
            int roleId = await roleSqlRepository
                .AsQueryable(true)
                .Where(x => x.Code == RoleConst.CODE_CUSTOMER && x.Status == RoleConst.STATUS_ACTIVED)
                .Select(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (roleId == 0)
            {
                return Result<int>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);
            }
            User user = mapper.Map<User>(request);
            user.PasswordHash = passwordHash.Hash(request.Password!);
            user.OtpCode = Random.Shared.Next(100000, 999999).ToString();

            // Bắt đầu transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Thêm vào repository
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Tạo và liên kết user role
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId
                };
                user.UserRoles = new List<UserRole> { userRole };

                // Tạo và liên kết customer
                var customer = new Customer
                {
                    UserId = user.Id, // Gán cứng UserId vừa sinh ra
                    FullName = request.FullName!,
                    Phone = request.Phone!,
                    Source = SourceEnum.ONLINE.ToString(),
                    CreatedAt = DateTimeHelper.UtcNow(),
                    Status = request.Status ?? (int)StatusActiveEnum.ACTIVED
                };
                user.Customer = customer;

                // Lưu thay đổi vào database
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                // Gửi email OTP qua queue
                var otpMail = emailTemplateFactory.CreateOtpEmail(
                    user.Email,
                    user.Username,
                    user.OtpCode,
                    UserConst.OTP_CODE_EXPIRY_MINUTES);
                await domainEventPublisher.PublishAsync(new SendEmailEvent
                {
                    ToEmail = otpMail.ToEmail,
                    Subject = otpMail.Subject,
                    HtmlBody = otpMail.HtmlBody,
                }, cancellationToken);

                // Gửi event để tạo wallet và membership card khi customer được tạo
                await domainEventPublisher.PublishAsync(new CreatedUserEvent
                {
                    UserId = user.Id,
                    CustomerId = customer.Id
                }, cancellationToken);

                return Result<int>.Created(user.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
