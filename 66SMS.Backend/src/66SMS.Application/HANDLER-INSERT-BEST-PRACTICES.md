# Best Practices: Insert Nhiều Entity Trong Handler

Tài liệu này mô tả các pattern chuẩn khi viết handler có insert nhiều entity liên quan trong project 66SMS, dựa trên các handler thực tế trong codebase.

---

## Tổng quan 4 Pattern Chính

| Pattern | Khi nào dùng | Handler ví dụ |
|---------|-------------|----------------|
| **Hybrid** | Entities có quan hệ cha-con, EF Core cascade | `RegisterHandler` |
| **Sequential** | Entity B cần ID của entity A trước | `CreateStaffHandler` |
| **Bulk Insert** | Nhiều entity cùng loại, không phụ thuộc nhau | `BulkCreateWorkScheduleHandler` |
| **Junction** | Tạo bảng trung gian (many-to-many) | `AssignPermissionsHandler` |

---

## Pattern 1 — Hybrid (Navigation Property + 1 SaveAsync)

### Khi nào dùng
- Các entity có quan hệ cha-con rõ ràng (1-1, 1-N)
- EF Core đã được cấu hình đúng relationship trong `Configuration`
- Muốn insert tất cả trong 1 lần SaveAsync (hiệu năng tốt nhất)

### Cách làm

```csharp
// 1. Fetch dependencies TRƯỚC khi mở transaction
var role = await roleSqlRepository
    .AsQueryable()
    .Where(x => x.Name.Equals("customer"))
    .FirstOrDefaultAsync(cancellationToken);

if (role == null)
    return Result<int>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

// 2. Mở transaction
using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
try
{
    // 3. Tạo từng entity riêng lẻ
    var user = mapper.Map<User>(request);
    user.PasswordHash = passwordHash.Hash(request.Password!);

    var customer = new Customer { FullName = request.FullName!, Phone = request.Phone! };
    var wallet = new Wallet { Balance = 0, Status = WalletConst.STATUS_ACTIVE };
    var userRole = new UserRole { RoleId = role.Id };

    // 4. Gán quan hệ tường minh (explicit relationship)
    user.Customer = customer;       // User → Customer
    customer.Wallet = wallet;       // Customer → Wallet
    user.UserRoles = new List<UserRole> { userRole };   // User → UserRole

    // 5. Chỉ Add entity gốc — EF Core tự cascade insert toàn bộ
    // Thứ tự insert: User → Customer (UserId) → Wallet (CustomerId) → UserRole (UserId)
    userSqlRepository.Add(user);
    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

    transaction.Commit();
    return Result<int>.Created(user.Id);
}
catch
{
    transaction.Rollback();
    throw;
}
```

### Tại sao hoạt động
EF Core change tracking theo dõi toàn bộ object graph. Khi `Add(user)` được gọi, EF Core tự động track tất cả entity được gán qua navigation property và insert theo đúng thứ tự FK.

### Anti-pattern cần tránh

```csharp
// ❌ KHÔNG hardcode FK khi entity chưa được save
var userRole = new UserRole
{
    UserId = user.Id,   // user.Id = 0 lúc này!
    RoleId = role.Id
};

// ❌ KHÔNG set FK thủ công khi đã dùng navigation property
user.Customer = customer;
customer.UserId = user.Id;  // Thừa và sai — user.Id chưa có
```

---

## Pattern 2 — Sequential (Nhiều SaveAsync trong 1 Transaction)

### Khi nào dùng
- Entity B cần ID thực của entity A (có logic phụ thuộc giữa các bước)
- Cần thực hiện logic tính toán dùng ID sinh ra (ví dụ: generate mã code duy nhất)
- Quan hệ phức tạp, không hoàn toàn dựa vào EF Core cascade

### Cách làm

```csharp
using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
try
{
    // Bước 1: Tạo và lưu User trước để có user.Id
    var user = mapper.Map<User>(request);
    user.PasswordHash = passwordHash.Hash(request.Password!);
    user.CreatedAt = DateTimeHelper.UtcNow();

    userSqlRepository.Add(user);
    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
    // Sau dòng này: user.Id đã có giá trị thực từ database

    // Bước 2: Tạo Staff dùng user.Id vừa có
    var staff = mapper.Map<Staff>(request);
    staff.UserId = user.Id;                          // FK đã có giá trị thực
    staff.Code = await GenerateUniqueCodeAsync();    // Logic cần chạy sau khi có user

    staffSqlRepository.Add(staff);
    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
    // Sau dòng này: staff.Id đã có giá trị thực

    // Bước 3: Tạo UserRole dùng user.Id
    var userRole = new UserRole { UserId = user.Id, RoleId = role.Id };
    userRoleSqlRepository.Add(userRole);
    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

    transaction.Commit();
    return Result<object>.Created(staff.Id);
}
catch
{
    transaction.Rollback();
    throw;
}
```

### Khi nào dùng Sequential thay vì Hybrid

| Tình huống | Nên dùng |
|-----------|----------|
| Entity B chỉ cần FK từ A | Hybrid |
| Entity B cần ID của A để làm thêm logic | Sequential |
| Cần generate code duy nhất dựa trên ID | Sequential |
| Cần gọi external service giữa các bước | Sequential |
| Các entity thuộc các aggregate root khác nhau | Sequential |

---

## Pattern 3 — Bulk Insert (AddRange + 1 SaveAsync)

### Khi nào dùng
- Insert nhiều entity cùng loại (ví dụ: danh sách lịch làm việc, nhiều ảnh)
- Các entity không phụ thuộc nhau về ID
- Muốn hiệu năng tốt nhất với số lượng lớn

### Cách làm

```csharp
// 1. Validate và dedup TRƯỚC khi mở transaction
var existingSchedules = await workScheduleSqlRepository
    .AsQueryable()
    .Where(x => staffIds.Contains(x.StaffId) && workDates.Contains(x.WorkDate))
    .ToListAsync(cancellationToken);

var validSchedules = new List<WorkSchedule>();
foreach (var item in request.Schedules)
{
    bool isDuplicate = existingSchedules.Any(x =>
        x.StaffId == item.StaffId && x.WorkDate == item.WorkDate);

    if (!isDuplicate)
    {
        var entity = mapper.Map<WorkSchedule>(item);
        entity.CreatedAt = DateTime.UtcNow;
        entity.Status = WorkScheduleConst.STATUS_ACTIVED;
        validSchedules.Add(entity);
    }
}

// 2. Early return nếu không có gì để insert
if (validSchedules.Count == 0)
    return Result<object>.Success(0);

// 3. Bulk insert trong transaction
using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
try
{
    workScheduleSqlRepository.AddRange(validSchedules);  // Một lần duy nhất
    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

    transaction.Commit();
    return Result<object>.Created(validSchedules.Count);
}
catch
{
    transaction.Rollback();
    throw;
}
```

### Anti-pattern cần tránh

```csharp
// ❌ KHÔNG Add từng entity một trong loop — performance rất tệ
foreach (var item in items)
{
    repository.Add(item);
    await sqlUnitOfWork.SaveChangeAsync();  // N lần round-trip database!
}

// ✅ ĐÚNG: Chuẩn bị list rồi AddRange 1 lần
repository.AddRange(items);
await sqlUnitOfWork.SaveChangeAsync();
```

---

## Pattern 4 — Junction (Many-to-Many)

### Khi nào dùng
- Tạo bảng trung gian liên kết 2 entity (Role-Permission, User-Role)
- Cần validate cả 2 phía tồn tại trước khi tạo link
- Thao tác đơn giản, không cần cascade

### Cách làm

```csharp
// 1. Validate cả 2 phía tồn tại
bool hasRole = await roleSqlRepository.AsQueryable()
    .Where(x => x.Id == request.RoleId)
    .AnyAsync(cancellationToken);

if (!hasRole)
    return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

int permissionCount = await permissionSqlRepository.AsQueryable()
    .Where(x => request.PermissionIds.Contains(x.Id))
    .CountAsync(cancellationToken);

if (permissionCount != request.PermissionIds.Count)
    return Result<object>.NotFound("Một số permission không tồn tại", ErrorCodes.ERR_NOT_FOUND);

// 2. Tạo danh sách junction entities
var rolePermissions = request.PermissionIds.Select(permissionId => new RolePermission
{
    RoleId = request.RoleId,
    PermissionId = permissionId,
    AssignedAt = DateTimeHelper.UtcNow()
}).ToList();

// 3. Bulk insert (không cần transaction phức tạp cho thao tác đơn giản)
rolePermissionSqlRepository.AddRange(rolePermissions);
await rolePermissionSqlRepository.SaveChangeAsync(cancellationToken);

return Result<object>.Created(rolePermissions.Count);
```

---

## Quy tắc Transaction

### Luôn dùng cấu trúc này

```csharp
using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
try
{
    // ... các thao tác ...
    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
    transaction.Commit();
    return Result<T>.Created(...);
}
catch
{
    transaction.Rollback();
    throw;  // Re-throw để middleware xử lý
}
```

### Fetch dependencies TRƯỚC transaction

```csharp
// ✅ ĐÚNG: Fetch Role trước khi mở transaction
var role = await roleSqlRepository.AsQueryable()
    .Where(x => x.Name.Equals("customer"))
    .FirstOrDefaultAsync(cancellationToken);

if (role == null)
    return Result<int>.NotFound(...);  // Trả về sớm, không tốn transaction

using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
// ...

// ❌ SAI: Fetch Role trong transaction — giữ lock lâu không cần thiết
using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
try
{
    var role = await roleSqlRepository.AsQueryable()...  // Lock transaction dài hơn
}
```

### Số lần SaveChangeAsync

| Tình huống | Số lần SaveAsync |
|-----------|-----------------|
| Hybrid pattern — cascade qua navigation | 1 lần |
| Bulk insert cùng loại entity | 1 lần |
| Sequential — B cần ID của A | Nhiều lần (mỗi bước 1 lần) |
| Update nhiều entity độc lập | 1 lần (Update tất cả trước, rồi Save) |

---

## Cấu hình EF Core Relationship (bắt buộc để Hybrid hoạt động)

Để EF Core tự cascade insert, relationship phải được cấu hình đúng **cả 2 phía**:

```csharp
// UserConfiguration.cs
builder.HasOne(x => x.Customer)
    .WithOne(c => c.User)                        // ✅ Phải có WithOne(c => c.User)
    .HasForeignKey<Customer>(x => x.UserId)
    .IsRequired(false);

// CustomerConfiguration.cs
builder.HasOne(x => x.Wallet)
    .WithOne(c => c.Customer)                    // ✅ Phải có WithOne(c => c.Customer)
    .HasForeignKey<Wallet>(x => x.CustomerId)
    .IsRequired(false);

// ❌ THIẾU inverse navigation — EF Core có thể không track đúng
builder.HasOne(x => x.Customer)
    .WithOne()                                   // Không khai báo inverse
    .HasForeignKey<Customer>(x => x.UserId);
```

---

## Checklist Nhanh Khi Viết Handler Insert

```
[ ] Validate input và check duplicate TRƯỚC transaction
[ ] Fetch tất cả dependencies (Role, Category...) TRƯỚC transaction
[ ] Early return khi validation fail — không mở transaction thừa
[ ] Dùng navigation property thay vì hardcode FK = 0
[ ] Chọn đúng pattern: Hybrid / Sequential / Bulk / Junction
[ ] Đặt CreatedAt = DateTimeHelper.UtcNow() cho mỗi entity mới
[ ] Bọc toàn bộ trong using IDbTransaction + try/catch Rollback
[ ] Dùng AddRange thay vì Add trong loop khi bulk insert
[ ] Trả về Result<T>.Created(id) sau khi commit thành công
```

---

## Thứ tự Insert Của EF Core (Hybrid Pattern)

Khi dùng Hybrid pattern với User, EF Core insert theo thứ tự:

```
userSqlRepository.Add(user)
        ↓
sqlUnitOfWork.SaveChangeAsync()
        ↓
┌─────────────────────────────────────────────┐
│ INSERT Users → sinh user.Id = 5             │
│ INSERT Customers (UserId = 5) → sinh Id = 10│
│ INSERT Wallets (CustomerId = 10)            │
│ INSERT UserRoles (UserId = 5)               │
└─────────────────────────────────────────────┘
        ↓
transaction.Commit()
```

EF Core tự xác định thứ tự dựa trên FK dependencies — không cần lập trình thủ công.
