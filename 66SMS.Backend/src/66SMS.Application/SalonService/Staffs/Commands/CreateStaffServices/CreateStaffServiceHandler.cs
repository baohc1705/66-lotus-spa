using MediatR;
using _66SMS.Contracts.Shared;
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
        // distinct service ids
        var distinctServiceIds = request.ServiceIds!.Distinct().ToList();
        // get existing staff services
        var existingStaffServices = await staffServiceSqlRepository
            .AsQueryable(true)
            .Where(x => x.StaffId == request.StaffId && distinctServiceIds!.Contains(x.ServiceId))
            .ToListAsync(cancellationToken);

        // if all services are already associated with the staff, return conflict
        if (distinctServiceIds.Count == existingStaffServices.Count)
        {
            return Result<List<int>>.Conflict();
        }

        // chỉ tạo các service chưa được phân công
        var existingServiceIds = existingStaffServices.Select(x => x.ServiceId).ToHashSet();
        var serviceIdsToCreate = distinctServiceIds
            .Where(id => !existingServiceIds.Contains(id))
            .ToList();

        // create new staff services
        var newStaffServices = serviceIdsToCreate.Select(x => new StaffService
        {
            StaffId = request.StaffId!.Value,
            ServiceId = x,
            Status = request.Status!.Value,
            CreatedAt = request.CreatedAt!.Value,
        }).ToList();

        // begin transaction
        using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // add new staff services
            staffServiceSqlRepository.AddRange(newStaffServices);

            // save changes
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            // commit transaction
            transaction.Commit();

            // return created staff services
            return Result<List<int>>.Created(newStaffServices.Select(x => x.Id).ToList());
        }
        catch
        {
            // rollback transaction
            transaction.Rollback();
            throw;
        }
    }

}
