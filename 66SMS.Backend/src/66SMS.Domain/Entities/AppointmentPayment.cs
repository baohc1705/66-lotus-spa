using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class AppointmentPayment : EntityBase<int>
    {
        public int AppointmentId { get; set; }
        public int Phase { get; set; }
        public decimal Amount { get; set; }
        public decimal RefundedAmount { get; set; }
        public int Method { get; set; }
        public string? TransactionId { get; set; }
        public DateTime? DueDate { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Appointment? Appointment { get; set; }
        public ICollection<WalletTransaction>? WalletTransactions { get; set; }
    }
}
