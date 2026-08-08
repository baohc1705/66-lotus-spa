using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using _66SMS.Contract.Shared;
using Microsoft.EntityFrameworkCore;
using System.Data;
namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaffServices;

public class DeleteStaffServiceHandler : IRequestHandler<DeleteStaffServiceCommand, Result<object>>
{
    private readonly IStaffServiceSqlRepository staffServiceSqlRepository;
    private readonly ISqlUnitOfWork sqlUnitOfWork;
    public DeleteStaffServiceHandler(IStaffServiceSqlRepository staffServiceSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
    {
        this.staffServiceSqlRepository = staffServiceSqlRepository;
        this.sqlUnitOfWork = sqlUnitOfWork;
    }
    
    public async Task<Result<object>> Handle(DeleteStaffServiceCommand request, CancellationToken cancellationToken)
    {
        // distinct ids
        var distinctIds = request.Ids!.Distinct().ToList();
        // get existing staff services
        var existingStaffServices = await staffServiceSqlRepository
            .AsQueryable(true)
            .Where(x => distinctIds!.Contains(x.Id))
            .ToListAsync(cancellationToken);
        
        // if no staff services found, return not found
        if (existingStaffServices.Count == 0)
        {
            return Result<object>.NotFound();
        }

        // begin transaction
        using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // delete staff services
            staffServiceSqlRepository.RemoveRange(existingStaffServices);

            // save changes
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            // commit transaction
            transaction.Commit();

            // return success
            return Result<object>.Ok();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}
