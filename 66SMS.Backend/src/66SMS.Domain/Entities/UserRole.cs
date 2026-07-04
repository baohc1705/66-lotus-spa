using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class UserRole : EntityBase<int>
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public int? AssignedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public User? User { get; set; }
        public Role? Role { get; set; }
    }
}
