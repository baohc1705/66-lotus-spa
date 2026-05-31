using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class RolePermission : EntityAuditTable<int>
    {
        public int RoleId { get; set; }
        public int PermissionId { get; set; }
        public DateTime AssignedAt { get; set; }

        public Role? Role { get; set; }
        public Permission? Permission { get; set; }
    }
}
