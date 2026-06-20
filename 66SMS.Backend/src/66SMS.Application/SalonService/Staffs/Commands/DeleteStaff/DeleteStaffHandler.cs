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
using System;

namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaff
{
    public class DeleteStaffHandler : IRequestHandler<DeleteStaffCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteStaffHandler(
            IUserSqlRepository userSqlRepository,
            IUserRoleSqlRepository userRoleSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.userSqlRepository = userSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
        {
            Staff? staff = await staffSqlRepository.FindByIdAsync((int)request.Id!, false);
            if (staff == null)
                return Result<object>.NotFound();

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                staff.Status = _66SMS.Domain.Constants.StaffConst.STATUS_DELETED;
                staff.UpdatedAt = DateTime.UtcNow;
                staff.UpdatedBy = request.UpdatedBy;
                staffSqlRepository.Update(staff);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                User? user = await userSqlRepository.FindByIdAsync(staff.UserId, false);
                if (user != null)
                {
                    user.Status = _66SMS.Domain.Constants.UserConst.STATUS_DELETED;
                    user.UpdatedAt = DateTime.UtcNow;
                    user.UpdatedBy = request.UpdatedBy;
                    userSqlRepository.Update(user);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
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
