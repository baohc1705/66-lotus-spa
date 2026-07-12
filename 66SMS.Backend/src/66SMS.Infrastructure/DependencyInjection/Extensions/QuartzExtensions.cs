using _66SMS.Contract.Settings;
using _66SMS.Infrastructure.BackgroundJobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;

namespace _66SMS.Infrastructure.DependencyInjection.Extensions
{
    public static class QuartzExtensions
    {
        public static IServiceCollection AddBackgroundJobs(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<BackgroundJobSettings>(
                configuration.GetSection(BackgroundJobSettings.SectionName));

            var settings = configuration
                .GetSection(BackgroundJobSettings.SectionName)
                .Get<BackgroundJobSettings>() ?? new BackgroundJobSettings();

            services.AddQuartz(q =>
            {
                q.AddJobWithSchedule<CleanupRevokedRefreshTokensJob>(
                    settings.CleanupRevokedRefreshTokens);
            });

            services.AddQuartzHostedService(options =>
            {
                options.WaitForJobsToComplete = true;
            });

            return services;
        }

        /// <summary>
        /// Đăng ký job + trigger theo JobScheduleSettings (dùng lại cho mọi job).
        /// </summary>
        public static void AddJobWithSchedule<TJob>(
            this IServiceCollectionQuartzConfigurator quartz,
            JobScheduleSettings schedule,
            string? jobName = null)
            where TJob : class, IJob
        {
            var name = jobName ?? typeof(TJob).Name;
            var jobKey = new JobKey(name);

            quartz.AddJob<TJob>(opts => opts.WithIdentity(jobKey));

            quartz.AddTrigger(opts =>
            {
                opts.ForJob(jobKey).WithIdentity($"{name}-trigger").StartNow();
                ApplySchedule(opts, schedule, name);
            });
        }

        private static void ApplySchedule(
            ITriggerConfigurator opts,
            JobScheduleSettings schedule,
            string jobName)
        {
            if (schedule.IntervalMinutes > 0)
            {
                opts.WithSimpleSchedule(x => x
                    .WithIntervalInMinutes(schedule.IntervalMinutes)
                    .RepeatForever());
                return;
            }

            if (!string.IsNullOrWhiteSpace(schedule.Cron))
            {
                opts.WithCronSchedule(schedule.Cron);
                return;
            }

            throw new InvalidOperationException(
                $"Job '{jobName}': cần IntervalMinutes > 0 hoặc Cron hợp.");
        }
    }
}
