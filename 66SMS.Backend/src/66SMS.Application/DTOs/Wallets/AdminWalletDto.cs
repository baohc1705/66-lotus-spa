using System;

namespace _66SMS.Application.DTOs.Wallets
{
    public class AdminWalletDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAvatar { get; set; }
        public decimal Balance { get; set; }
        public int Status { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}
