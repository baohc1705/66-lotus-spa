using System.Data;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using _66SMS.Domain.Messages;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Infrastructure.Consumers;

public class CreatedUserConsumer : IConsumer<CreatedUserEvent>
{
    private readonly IWalletSqlRepository walletSqlRepository;
    private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
    private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
    private readonly ISqlUnitOfWork sqlUnitOfWork;

    public CreatedUserConsumer(
        IWalletSqlRepository walletSqlRepository,
        IMembershipCardSqlRepository membershipCardSqlRepository,
        IMembershipTierSqlRepository membershipTierSqlRepository,
        ISqlUnitOfWork sqlUnitOfWork)
    {
        this.walletSqlRepository = walletSqlRepository;
        this.membershipCardSqlRepository = membershipCardSqlRepository;
        this.membershipTierSqlRepository = membershipTierSqlRepository;
        this.sqlUnitOfWork = sqlUnitOfWork;
    }

    public async Task Consume(ConsumeContext<CreatedUserEvent> context)
    {
        var message = context.Message;

        bool walletExists = await walletSqlRepository.AsQueryable(true)
            .AnyAsync(w => w.CustomerId == message.CustomerId, context.CancellationToken);

        bool cardExists = await membershipCardSqlRepository.AsQueryable(true)
            .AnyAsync(c => c.CustomerId == message.CustomerId, context.CancellationToken);

        if (walletExists && cardExists)
            return;

        int membershipTierId = await membershipTierSqlRepository
            .AsQueryable(true)
            .Where(x => x.Code == MembershipTierConst.MEMBERSHIP_CARD_TIER_COMMON)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(context.CancellationToken);

        var wallet = new Wallet
        {
            CustomerId = message.CustomerId,
            Balance = 0,
            Status = (int)StatusActiveEnum.ACTIVED,
            CreatedAt = DateTime.UtcNow
        };

        var membershipCard = new MembershipCard
        {
            CustomerId = message.CustomerId,
            MembershipTierId = membershipTierId,
            IssuedAt = DateTime.UtcNow,
            Status = (int)StatusActiveEnum.ACTIVED
        };

        using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(context.CancellationToken);
        try
        {
            walletSqlRepository.Add(wallet);
            membershipCardSqlRepository.Add(membershipCard);
            await sqlUnitOfWork.SaveChangeAsync(context.CancellationToken);
            membershipCard.CardCode = $"LOTUS-{membershipCard.Id:D6}";
            await sqlUnitOfWork.SaveChangeAsync(context.CancellationToken);
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}
