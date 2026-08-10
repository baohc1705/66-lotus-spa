using MediatR;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using System.Data;

namespace _66SMS.Application.SalonService.Staffs.Commands.UpdateStaffServices;

public class UpdateStaffServiceHandler : IRequestHandler<UpdateStaffServiceCommand, Result<object>>
{
    private readonly IStaffServiceSqlRepository staffServiceSqlRepository;
    private readonly ISqlUnitOfWork sqlUnitOfWork;
    private readonly IMapper mapper;
    public UpdateStaffServiceHandler(IStaffServiceSqlRepository staffServiceSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
    {
        this.staffServiceSqlRepository = staffServiceSqlRepository;
        this.sqlUnitOfWork = sqlUnitOfWork;
        this.mapper = mapper;
    }
    public async Task<Result<object>> Handle(UpdateStaffServiceCommand request, CancellationToken cancellationToken)
    {
        var existingStaffService = await staffServiceSqlRepository
          .AsQueryable(false)
          .Where(x => x.Id == request.Id)
          .FirstOrDefaultAsync(cancellationToken);
        if (existingStaffService == null)
        {
            return Result<object>.NotFound();
        }
        mapper.Map(request, existingStaffService);

        if (request.ServiceId.HasValue)
        {
            var existingService = await staffServiceSqlRepository
                .AsQueryable(false)
                .Where(x => x.Id == request.ServiceId && x.StaffId == request.StaffId)
                .ToListAsync(cancellationToken);
            if (existingService.Count > 0)
            {
                return Result<object>.Conflict();
            }
        }

        if (request.StaffId.HasValue)
        {
            var existingStaff = await staffServiceSqlRepository
                .AsQueryable(false)
                .Where(x => x.Id == request.StaffId && x.ServiceId == request.ServiceId)
                .ToListAsync(cancellationToken);
            if (existingStaff.Count > 0)
            {
                return Result<object>.Conflict();
            }
        }   

        using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            staffServiceSqlRepository.Update(existingStaffService);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
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
