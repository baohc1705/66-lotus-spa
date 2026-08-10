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
        var distinctIds = request.Ids!.Distinct().ToList();
        var existingStaffServices = await staffServiceSqlRepository
            .AsQueryable(true)
            .Where(x => distinctIds!.Contains(x.Id))
            .ToListAsync(cancellationToken);

        if (existingStaffServices.Count == 0)
        {
            return Result<object>.NotFound();
        }

        using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            staffServiceSqlRepository.RemoveRange(existingStaffServices);

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
