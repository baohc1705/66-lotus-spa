using _66SMS.Domain.Abstractions.Entities;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Domain.Entities
{
    public class UserRole : EntityBase<int>
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTimeOffset AssignedAt { get; set; } = DateTimeHelper.UtcNow();
        public int? AssignedBy { get; set; }

        public User? User { get; set; }
        public Role? Role { get; set; }
    }
}
