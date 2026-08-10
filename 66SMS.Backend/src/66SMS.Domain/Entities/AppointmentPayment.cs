using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class AppointmentPayment : EntityBase<int>
    {
        public int AppointmentId { get; set; }
        public int Phase { get; set; }
        public decimal Amount { get; set; } = 0;
        public decimal RefundedAmount { get; set; } = 0;
        public int Method { get; set; }
        public string? TransactionId { get; set; }
        public DateTimeOffset? DueDate { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        // Navigation properties
        public Appointment? Appointment { get; set; }
        public ICollection<WalletTransaction>? WalletTransactions { get; set; }
    }
}
