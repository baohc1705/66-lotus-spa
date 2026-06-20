# Best Practices: Cấu hình EF Core Relationship

Tài liệu này thống nhất cách cấu hình 3 loại quan hệ (1-1, 1-N, N-N) để tránh lỗi thường gặp và dễ bảo trì.

---

## Nguyên tắc cốt lõi

> **1. Mỗi quan hệ chỉ cấu hình ở 1 nơi duy nhất**  
> **2. Cấu hình ở entity CON (dependent — entity có FK column)**  
> **3. Khai báo rõ ràng `WithOne()` hoặc `WithMany()` để support Hybrid pattern**

---

## 1-1 Relationship (One-to-One)

### Khái niệm

```
User (Principal/Cha, id=1)    ←FK UserId→    Customer (Dependent/Con)
```

- **Principal (cha)**: Entity không có FK
- **Dependent (con)**: Entity có FK column
- Cấu hình ở entity **CON duy nhất** vì FK nằm ở đó

### Cách cấu hình đúng

**Entity — Customer.cs (CON):**
```csharp
public class Customer : EntityBase<int>
{
    public int? UserId { get; set; }      // FK về User
    public User User { get; set; } = null!;  // ✅ Navigation về cha
    // ... properties khác ...
}
```

**Entity — User.cs (CHA):**
```csharp
public class User : EntityBase<int>
{
    // ✅ Giữ navigation nếu dùng cascade insert hoặc Include
    public Customer? Customer { get; set; }
    // ... properties khác ...
}
```

**Configuration — CustomerConfiguration.cs (CON):**
```csharp
public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        // ... property configs ...
        
        // ✅ Cấu hình ở entity CON (có FK)
        builder.HasOne(x => x.User)
            .WithOne(u => u.Customer)         // Khai báo inverse navigation rõ ràng
            .HasForeignKey<Customer>(x => x.UserId)  // FK ở Customer
            .IsRequired(false);               // FK nullable — có thể không có User
        
        builder.ToTable(CustomerConst.TABLE_NAME);
    }
}
```

**Configuration — UserConfiguration.cs (CHA):**
```csharp
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // ... property configs ...
        
        // ❌ XÓA dòng này — đã cấu hình bên CustomerConfiguration rồi
        // builder.HasOne(x => x.Customer).WithOne(c => c.User)...
        
        builder.ToTable(UserConst.TABLE_NAME);
    }
}
```

### Mẫu khác: Customer ↔ Wallet (1-1)

```
Customer (cha)  ←FK CustomerId→  Wallet (con)
```

**WalletConfiguration.cs (CON):**
```csharp
builder.HasOne(x => x.Customer)
    .WithOne(c => c.Wallet)
    .HasForeignKey<Wallet>(x => x.CustomerId)
    .IsRequired(false);
```

**CustomerConfiguration.cs (CHA):**
```csharp
// ❌ XÓA dòng HasOne.Wallet — đã cấu hình bên WalletConfiguration
// builder.HasOne(x => x.Wallet).WithOne(x => x.Customer)...
```

---

## 1-N Relationship (One-to-Many)

### Khái niệm

```
User (1)  ←→  UserRole[] (N)
```

- **Principal (1)**: User
- **Dependent (N)**: UserRole có FK UserId
- Cấu hình ở entity **CON (phía N)** duy nhất

### Cách cấu hình đúng

**Entity — UserRole.cs (CON):**
```csharp
public class UserRole : EntityBase<int>
{
    public int UserId { get; set; }      // FK về User
    public int RoleId { get; set; }      // FK về Role
    public User? User { get; set; }      // ✅ Navigation về User
    public Role? Role { get; set; }      // ✅ Navigation về Role
}
```

**Entity — User.cs (CHA):**
```csharp
public class User : EntityBase<int>
{
    // ✅ Giữ collection nếu dùng cascade insert hoặc Include
    public List<UserRole>? UserRoles { get; set; }
}
```

**Configuration — UserRoleConfiguration.cs (CON):**
```csharp
public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.HasKey(x => x.Id);
        // ... property configs ...

        // ✅ Cấu hình ở entity CON
        builder.HasOne(x => x.User)
            .WithMany(u => u.UserRoles)     // Khai báo collection ở cHA
            .HasForeignKey(x => x.UserId);

        builder.HasOne(x => x.Role)
            .WithMany(r => r.UserRoles)     // Khai báo collection ở CHA
            .HasForeignKey(x => x.RoleId);

        builder.ToTable(UserRoleConst.TABLE_NAME);
    }
}
```

**Configuration — UserConfiguration.cs (CHA):**
```csharp
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // ... property configs ...
        
        // ❌ KHÔNG cấu hình lại — đã cấu hình bên UserRoleConfiguration
        // builder.HasMany(x => x.UserRoles).WithOne(x => x.User)...
        
        builder.ToTable(UserConst.TABLE_NAME);
    }
}
```

---

## N-N Relationship (Many-to-Many) via Junction Table

### Khái niệm

```
Role (N)  ←→  RolePermission (Junction)  ←→  Permission (N)
```

- **Junction table** (bảng trung gian): RolePermission có 2 FK
- Cấu hình ở **junction table duy nhất**
- Dùng `HasOne().WithMany()` × 2

### Cách cấu hình đúng

**Entity — RolePermission.cs (Junction):**
```csharp
public class RolePermission : EntityBase<int>
{
    public int RoleId { get; set; }          // FK về Role
    public int PermissionId { get; set; }    // FK về Permission
    public Role? Role { get; set; }          // ✅ Navigation về Role
    public Permission? Permission { get; set; } // ✅ Navigation về Permission
}
```

**Entity — Role.cs (Principal):**
```csharp
public class Role : EntityBase<int>
{
    // ✅ Giữ collection nếu cần query role.RolePermissions hoặc cascade insert
    public List<RolePermission>? RolePermissions { get; set; }
}
```

**Configuration — RolePermissionConfiguration.cs (Junction):**
```csharp
public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.HasKey(x => x.Id);
        // ... property configs ...

        // ✅ Cấu hình cả 2 FK ở entity Junction
        builder.HasOne(x => x.Role)
            .WithMany(r => r.RolePermissions)      // Khai báo inverse collection
            .HasForeignKey(x => x.RoleId)
            .IsRequired(false);

        builder.HasOne(x => x.Permission)
            .WithMany(p => p.RolePermissions)      // Khai báo inverse collection
            .HasForeignKey(x => x.PermissionId)
            .IsRequired(false);

        builder.ToTable(RolePermissionConst.TABLE_NAME);
    }
}
```

**Configuration — RoleConfiguration.cs (Principal):**
```csharp
public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        // ... property configs ...
        
        // ❌ KHÔNG cấu hình lại — đã cấu hình bên RolePermissionConfiguration
        // builder.HasMany(x => x.RolePermissions)...
        
        builder.ToTable(RoleConst.TABLE_NAME);
    }
}
```

---

## Navigation Properties Trong Entity

### Khi nào nên có navigation 2 chiều?

**EF Core không bắt buộc** navigation property ở cả 2 phía. Nhưng nên có nếu:

| Tình huống | Nên có? | Lý do |
|-----------|--------|-------|
| Dùng Hybrid pattern (cascade insert) | ✅ | `user.Customer = customer` cần navigation ở User |
| Hay dùng `Include(u => u.Customer)` | ✅ | Cần navigation để query |
| Không bao giờ truy cập từ phía cha | ❌ | Không cần — chỉ lãng phí memory |
| Tạo circular reference JSON | ⚠️ | Nên có, nhưng đặt `[JsonIgnore]` |

### Entity CON — LUÔN có navigation về cha

```csharp
public class Customer : EntityBase<int>
{
    public int? UserId { get; set; }
    public User User { get; set; } = null!;  // ✅ Bắt buộc
}

public class UserRole : EntityBase<int>
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public User? User { get; set; }          // ✅ Bắt buộc
    public Role? Role { get; set; }          // ✅ Bắt buộc
}
```

### Entity CHA — Có hoặc không tuỳ use case

```csharp
public class User : EntityBase<int>
{
    // ✅ CÓ — vì Hybrid pattern dùng `user.Customer = customer` để cascade insert
    public Customer? Customer { get; set; }
    
    // ✅ CÓ — vì handler dùng `user.UserRoles = new List<UserRole> { ... }` để cascade insert
    public List<UserRole>? UserRoles { get; set; }
}
```

### Đặt `[JsonIgnore]` để tránh circular reference

```csharp
public class Customer : EntityBase<int>
{
    public int? UserId { get; set; }
    
    // ❌ Nếu không có [JsonIgnore], sẽ bị:
    // Customer → User → Customer → User → ... (vô tận)
    [JsonIgnore]
    public User User { get; set; } = null!;
    
    [JsonIgnore]
    public Wallet? Wallet { get; set; }
}
```

---

## Tóm tắt Quy Tắc

### Configuration File

| Loại QH | Cấu hình ở | Phương thức | Ví dụ |
|---------|----------|-----------|-------|
| **1-1** | Entity CON | `HasOne().WithOne()` | `Customer` config về User |
| **1-N** | Entity CON | `HasOne().WithMany()` | `UserRole` config về User/Role |
| **N-N** | Entity Junction | `HasOne().WithMany()` × 2 | `RolePermission` config cả 2 FK |

### Entity Navigation Property

| Loại QH | Entity CON | Entity CHA |
|---------|-----------|-----------|
| **1-1** | ✅ Có `NavProp` cha | ✅ Nên có nếu dùng cascade insert |
| **1-N** | ✅ Có `NavProp` cha | ✅ Nên có `ICollection<T>` nếu dùng cascade insert |
| **N-N** | ✅ Có cả 2 `NavProp` | ✅ Nên có `ICollection<Junction>` nếu dùng cascade insert |

### Inverse Navigation

```csharp
// ✅ LUÔN khai báo rõ ràng
builder.HasOne(x => x.User)
    .WithOne(u => u.Customer)              // Inverse navigation rõ ràng
    .WithMany(u => u.UserRoles)            // hoặc .WithMany()
    .HasForeignKey(x => x.UserId);

// ❌ KHÔNG dựa vào convention ngầm
builder.HasOne(x => x.User)
    .WithOne()                              // EF Core có thể không tìm thấy
    .HasForeignKey(x => x.UserId);
```

---

## Checklist Khi Viết Configuration

```
[ ] Identify principal (cha) và dependent (con — entity có FK)
[ ] Cấu hình ở entity CON duy nhất
[ ] Khai báo inverse navigation rõ ràng (WithOne/WithMany)
[ ] Xác định FK column: HasForeignKey<Con>(x => x.FkProperty)
[ ] Xác định IsRequired (FK nullable hay không)
[ ] Xóa duplicate configuration ở entity cha
[ ] Kiểm tra navigation property ở entity có [JsonIgnore] khi cần
[ ] Build test: dotnet build
```

---

## Ví dụ thực tế — Hybrid Pattern (Insert nhiều entity)

```csharp
// CreateStaffHandler.cs
var user = mapper.Map<User>(request);
user.PasswordHash = passwordHash.Hash(request.Password!);

var staff = mapper.Map<Staff>(request);

// ✅ Set navigation property rõ ràng (cần configuration WithOne/WithMany)
staff.User = user;  // Staff có FK UserId

var userRole = new UserRole { RoleId = role.Id };
user.UserRoles = new List<UserRole> { userRole };  // User có collection UserRoles

// ✅ Add entity gốc — EF Core tự cascade insert theo FK dependencies
userSqlRepository.Add(user);
await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
// EF Core insert theo thứ tự: User → Staff (FK UserId) → UserRole (FK UserId)
```

Điều này hoạt động vì configuration khai báo rõ:
- `StaffConfiguration`: `HasOne(x => x.User).WithOne(u => u.Staff).HasForeignKey<Staff>(x => x.UserId)`
- `UserRoleConfiguration`: `HasOne(x => x.User).WithMany(u => u.UserRoles).HasForeignKey(x => x.UserId)`
