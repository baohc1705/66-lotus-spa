using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace _66SMS.Application.Features.Staffs.Commands.UpdateStaff
{
    public class UpdateStaffHandler : IRequestHandler<UpdateStaffCommand, Result<object>>
    {
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateStaffHandler(
            IStaffSqlRepository staffSqlRepository,
            IUserSqlRepository userSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.staffSqlRepository = staffSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                Staff? staff = await staffSqlRepository.FindByIdAsync((int)request.Id!, false);
                if (staff == null)
                    return Result<object>.NotFound();

                mapper.Map(request, staff);
                staff.UpdatedAt = DateTime.UtcNow;
                staff.UpdatedBy = request.UpdatedBy;
                staffSqlRepository.Update(staff);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (request.UserName != null || request.Email != null)
                {
                    User? user = await userSqlRepository.FindByIdAsync(staff.UserId, false);
                    if (user != null)
                    {
                        mapper.Map(request, user);
                        user.UpdatedAt = DateTime.UtcNow;
                        user.UpdatedBy = request.UpdatedBy;
                        userSqlRepository.Update(user);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

                transaction.Commit();
                return Result<object>.Created(staff.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
