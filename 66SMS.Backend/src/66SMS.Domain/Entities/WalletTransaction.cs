using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class WalletTransaction : EntityBase<int>
    {
        public int WalletId { get; set; }
        public int? AppointmentPaymentId { get; set; }
        public decimal Amount { get; set; }
        public decimal BalanceAfter { get; set; }
        public int Type { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public Wallet? Wallet { get; set; }
        public AppointmentPayment? AppointmentPayment { get; set; }
    }
}
