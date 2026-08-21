using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Messages;
using _66SMS.Contract.Settings;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Quartz;

namespace _66SMS.Infrastructure.BackgroundJobs
{
    [DisallowConcurrentExecution]
    public class SendOnlineAppointmentReminderJob : IJob
    {
        private readonly IServiceScopeFactory scopeFactory;
        private readonly ILogger<SendOnlineAppointmentReminderJob> logger;

        public SendOnlineAppointmentReminderJob(
            IServiceScopeFactory scopeFactory,
            ILogger<SendOnlineAppointmentReminderJob> logger)
        {
            this.scopeFactory = scopeFactory;
            this.logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            using var scope = scopeFactory.CreateScope();
            var appointmentRepository = scope.ServiceProvider.GetRequiredService<IAppointmentSqlRepository>();
            var emailTemplateFactory = scope.ServiceProvider.GetRequiredService<IEmailTemplateFactory>();
            var domainEventPublisher = scope.ServiceProvider.GetRequiredService<IDomainEventPublisher>();
            var clientAppSettings = scope.ServiceProvider.GetRequiredService<IOptions<ClientAppSettings>>().Value;

            var now = DateTimeHelper.UtcNow();

            // PRODUCTION:
            // Job chay moi 5 phut; chi gui lich co gio bat dau trong [now+55p, now+65p]
            // (cua so 10 phut de lan chay nao cung bat duoc lich con dung 1 gio).
            // var cuaSoBatDau = now.AddMinutes(55);
            // var cuaSoKetThuc = now.AddMinutes(65);

            // DEMO: true = bo loc 1 gio, gui moi lich online chua nhac (test ngay).
            // Khi len that: dat false + mo comment 2 dong PRODUCTION o tren.
            const bool demoBoQuaCuaSo1Gio = true;

            var trangThaiHopLe = new[]
            {
                AppointmentConst.STATUS_PENDING,
                AppointmentConst.STATUS_CONFIRMED,
                AppointmentConst.STATUS_WAITING,
            };

            var danhSachCanNhac = await appointmentRepository.AsQueryable(asNoTracking: true)
                .Where(a => trangThaiHopLe.Contains(a.Status))
                .Where(a => a.ReminderSentAt == null)
                .Where(a => a.TimeApptStart != null)
                .Where(a => a.LockId != null)
                .Select(a => new LichHenCanNhac
                {
                    Id = a.Id,
                    AppointmentDate = a.AppointmentDate,
                    TimeApptStart = a.TimeApptStart!.Value,
                    CustomerEmail = a.CreatedByUser!.Email,
                    CustomerName = a.CreatedByUser!.Customer != null
                        ? a.CreatedByUser.Customer.FullName
                        : a.CreatedByUser.Username,
                    ServiceNames = a.Services!
                        .Where(s => s.Service != null && s.Service.Name != null)
                        .Select(s => s.Service!.Name!)
                        .ToList(),
                })
                .ToListAsync(context.CancellationToken);

            var danhSachIdDaGui = new List<int>();
            // string? lienKetHuy = null;
            // if (!string.IsNullOrWhiteSpace(clientAppSettings.BaseUrl))
            // {
            //     lienKetHuy = $"{clientAppSettings.BaseUrl.TrimEnd('/')}/lich-hen";
            // }

            for (var index = 0; index < danhSachCanNhac.Count; index++)
            {
                var lichHen = danhSachCanNhac[index];

                var thoiDiemBatDau = new DateTimeOffset(
                    lichHen.AppointmentDate.ToDateTime(lichHen.TimeApptStart),
                    TimeSpan.FromHours(7));

                if (demoBoQuaCuaSo1Gio != true)
                {
                    var cuaSoBatDau = now.AddMinutes(55);
                    var cuaSoKetThuc = now.AddMinutes(65);
                    if (thoiDiemBatDau < cuaSoBatDau || thoiDiemBatDau > cuaSoKetThuc)
                        continue;
                }

                if (string.IsNullOrWhiteSpace(lichHen.CustomerEmail))
                    continue;

                var tenDichVuTomTat = "Dịch vụ spa";
                if (lichHen.ServiceNames.Count > 0)
                {
                    tenDichVuTomTat = string.Join(", ", lichHen.ServiceNames);
                }

                var tenKhachHang = lichHen.CustomerName;
                if (string.IsNullOrWhiteSpace(tenKhachHang))
                    tenKhachHang = "Khách hàng";

                var mail = emailTemplateFactory.CreateAppointmentReminder(
                    lichHen.CustomerEmail,
                    tenKhachHang,
                    tenDichVuTomTat,
                    lichHen.AppointmentDate.ToDateTime(lichHen.TimeApptStart),
                    null);

                await domainEventPublisher.PublishAsync(new SendEmailEvent
                {
                    ToEmail = mail.ToEmail,
                    Subject = mail.Subject,
                    HtmlBody = mail.HtmlBody,
                }, context.CancellationToken);

                danhSachIdDaGui.Add(lichHen.Id);
            }

            if (danhSachIdDaGui.Count == 0)
                return;

            var thoiDiemGui = DateTimeHelper.UtcNow();
            await appointmentRepository.AsQueryable(asNoTracking: true)
                .Where(a => danhSachIdDaGui.Contains(a.Id))
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(a => a.ReminderSentAt, thoiDiemGui),
                    context.CancellationToken);

            logger.LogInformation("Da gui {Count} email nhac lich hen online (truoc 1 gio).", danhSachIdDaGui.Count);
        }

        private sealed class LichHenCanNhac
        {
            public int Id { get; set; }
            public DateOnly AppointmentDate { get; set; }
            public TimeOnly TimeApptStart { get; set; }
            public string? CustomerEmail { get; set; }
            public string? CustomerName { get; set; }
            public List<string> ServiceNames { get; set; } = new();
        }
    }
}
