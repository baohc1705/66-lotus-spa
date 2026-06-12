using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Wallet : EntityBase<int>
    {
        public int CustomerId { get; set; }
        public decimal Balance { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

       
        public Customer? Customer { get; set; }
        public ICollection<WalletTransaction> Transactions { get; set; }
    }
}
