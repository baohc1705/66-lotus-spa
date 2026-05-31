using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.Employees.Commands.CreateEmployee
{
    public class CreateEmployeeHandler : IRequestHandler<CreateEmployeeCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IEmployeeSqlRepository employeeSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IPasswordHash passwordHash;

        public CreateEmployeeHandler(
            IUserSqlRepository userSqlRepository,
            IEmployeeSqlRepository employeeSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IPasswordHash passwordHash,
            IRoleSqlRepository roleSqlRepository,
            IUserRoleSqlRepository userRoleSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.employeeSqlRepository = employeeSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
            this.roleSqlRepository = roleSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
        }

        public async Task<Result<object>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra trùng email và username
            bool emailOrUsernameExisted = await userSqlRepository.Query()
                .Where(x => x.Email.Equals(request.Email) || x.Username.Equals(request.UserName))
                .AnyAsync(cancellationToken);

            if (emailOrUsernameExisted)
                return Result<object>.Conflict("Email or username existed", ErrorCodes.ERR_USER_ALREADY_EXISTS);

            User? user = mapper.Map<User>(request);
            user.PasswordHash = passwordHash.Hash(request.Password!);

            Employee? employee = mapper.Map<Employee>(request);

            // Tự động generate unique code (ví dụ: LOTUSNV0001, LOTUSNV0002)
            employee.Code = await GenerateUniqueEmployeeCodeAsync(cancellationToken);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Save user first
                userSqlRepository.Add(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Save employee
                employee.UserId = user.Id;
                employeeSqlRepository.Add(employee);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Save role
                string roleRequest = request.Role ?? "employee";
                Role? role = await roleSqlRepository.Query()
                    .Where(x => x.Name.Equals(roleRequest))
                    .FirstOrDefaultAsync(cancellationToken);

                if (role == null)
                    return Result<object>.BadRequest("Invalid role", ErrorCodes.ERR_BAD_REQUEST);

                UserRole userRole = new()
                {
                    UserId = user.Id,
                    RoleId = role.Id,
                    AssignedAt = DateTime.UtcNow,
                    AssignedBy = request.CreatedBy ?? 1
                };

                userRoleSqlRepository.Add(userRole);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                return Result<object>.Created(employee.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task<string> GenerateUniqueEmployeeCodeAsync(CancellationToken cancellationToken)
        {
            // Tìm code cuối cùng bắt đầu bằng "LOTUSNV"
            Employee? employee = await employeeSqlRepository.Query()
                .Where(x => x.Code.StartsWith("LOTUSNV"))
                .OrderBy(x => x.Code)
                .FirstOrDefaultAsync(cancellationToken);

            if (employee == null)
                return string.Empty;

            var lastCode = employee.Code;
            int nextNumber = 1;
            if (!string.IsNullOrEmpty(lastCode) && lastCode.Length > 7)
            {
                string numberPart = lastCode.Substring(7);
                if (int.TryParse(numberPart, out int parsedNumber))
                {
                    nextNumber = parsedNumber + 1;
                }
            }

            // Đảm bảo code là duy nhất bằng cách kiểm tra sự tồn tại trong DB
            string newCode;
            bool isUnique = false;
            do
            {
                newCode = $"LOTUSNV{nextNumber:D4}";
                bool exists = await employeeSqlRepository.Query()
                    .Where(x => x.Code == newCode)
                    .AnyAsync(cancellationToken);
                if (!exists) 
                    isUnique = true;
                else
                    nextNumber++;

            } while (!isUnique);

            return newCode;
        }
    }
}
