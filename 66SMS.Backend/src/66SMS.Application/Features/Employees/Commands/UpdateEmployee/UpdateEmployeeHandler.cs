using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;
using System.Threading;
using System.Threading.Tasks;

namespace _66SMS.Application.Features.Employees.Commands.UpdateEmployee
{
    public class UpdateEmployeeHandler : IRequestHandler<UpdateEmployeeCommand, Result<object>>
    {
        private readonly IEmployeeSqlRepository employeeSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateEmployeeHandler(
            IEmployeeSqlRepository employeeSqlRepository,
            IUserSqlRepository userSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.employeeSqlRepository = employeeSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Update employee
                Employee? employee = await employeeSqlRepository.FindByIdAsync((int)request.Id!, false);
                if (employee == null)
                    return Result<object>.NotFound();

                mapper.Map(request, employee);
                employeeSqlRepository.Update(employee);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Update user if account details are provided
                if (request.UserName != null || request.Email != null)
                {
                    User? user = await userSqlRepository.FindByIdAsync(employee.UserId, false);
                    if (user != null)
                    {
                        mapper.Map(request, user);
                        userSqlRepository.Update(user);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

                transaction.Commit();
                return Result<object>.Created(employee.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
