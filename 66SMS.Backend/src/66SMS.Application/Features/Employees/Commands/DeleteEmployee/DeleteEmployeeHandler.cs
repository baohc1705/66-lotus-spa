using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.Employees.Commands.DeleteEmployee
{
    public class DeleteEmployeeHandler : IRequestHandler<DeleteEmployeeCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IEmployeeSqlRepository employeeSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteEmployeeHandler(
            IUserSqlRepository userSqlRepository,
            IUserRoleSqlRepository userRoleSqlRepository,
            IEmployeeSqlRepository employeeSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.userSqlRepository = userSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.employeeSqlRepository = employeeSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
        {
            Employee? employee = await employeeSqlRepository.GetByIdAsync((int)request.Id!, false);
            if (employee == null)
                return Result<object>.NotFound();

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Soft remove employee
                employeeSqlRepository.SoftRemove(employee);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Soft remove associated user
                User? user = await userSqlRepository.GetByIdAsync(employee.UserId, false);
                if (user != null)
                {
                    userSqlRepository.SoftRemove(user);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                    // Soft remove user role relationship
                    UserRole? userRole = await userRoleSqlRepository.Query()
                        .Where(x => x.UserId == user.Id)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (userRole != null)
                    {
                        userRoleSqlRepository.SoftRemove(userRole);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
