using MediatR;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using System.Collections.Generic;
using System.Data;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.SalonService.Staffs.Commands.CreateStaffServices;

public class CreateStaffServiceHandler : IRequestHandler<CreateStaffServiceCommand, Result<List<int>>>
{
    private readonly IStaffServiceSqlRepository staffServiceSqlRepository;
    private readonly ISqlUnitOfWork sqlUnitOfWork;
    private readonly IMapper mapper;
    public CreateStaffServiceHandler(IStaffServiceSqlRepository staffServiceSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
    {
        this.staffServiceSqlRepository = staffServiceSqlRepository;
        this.sqlUnitOfWork = sqlUnitOfWork;
        this.mapper = mapper;
    }

    public async Task<Result<List<int>>> Handle(CreateStaffServiceCommand request, CancellationToken cancellationToken)
    {
        var distinctServiceIds = request.ServiceIds!.Distinct().ToList();
        var existingStaffServices = await staffServiceSqlRepository
            .AsQueryable(true)
            .Where(x => x.StaffId == request.StaffId && distinctServiceIds!.Contains(x.ServiceId))
            .ToListAsync(cancellationToken);

        if (distinctServiceIds.Count == existingStaffServices.Count)
        {
            return Result<List<int>>.Conflict();
        }

        var existingServiceIds = existingStaffServices.Select(x => x.ServiceId).ToHashSet();
        var serviceIdsToCreate = distinctServiceIds
            .Where(id => !existingServiceIds.Contains(id))
            .ToList();

        var newStaffServices = serviceIdsToCreate.Select(x => new StaffService
        {
            StaffId = request.StaffId!.Value,
            ServiceId = x,
            Status = request.Status!.Value,
            CreatedAt = request.CreatedAt!.Value,
        }).ToList();

        using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            staffServiceSqlRepository.AddRange(newStaffServices);

            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            transaction.Commit();

            return Result<List<int>>.Created(newStaffServices.Select(x => x.Id).ToList());
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

}
