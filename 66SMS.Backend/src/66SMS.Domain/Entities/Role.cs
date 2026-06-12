using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Role : EntityBase<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public List<UserRole>? UserRoles { get; set; }
        public List<RolePermission>? RolePermissions { get; set; }
    }
}
