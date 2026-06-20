using System;

namespace _66SMS.Application.DTOs.Wallets
{
    public class AdminWalletTransactionDto
    {
        public int Id { get; set; }
        public int WalletId { get; set; }
        public int? AppointmentPaymentId { get; set; }
        public decimal Amount { get; set; }
        public decimal BalanceAfter { get; set; }
        public int Type { get; set; }
        public string Note { get; set; } = null!;
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public string CreatedByName { get; set; } = null!;
    }
}
