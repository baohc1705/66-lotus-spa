using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IAppointmentPaymentSqlRepository : IGenericSqlRepository<AppointmentPayment, int>
    {
    }
}
