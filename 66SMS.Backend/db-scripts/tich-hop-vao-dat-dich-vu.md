# Tích hợp Khuyến Mãi vào Đặt Dịch Vụ (Đặt Lịch)

## Mô tả yêu cầu

Cho phép khách hàng **nhập mã khuyến mãi** trong luồng đặt lịch để được giảm giá trực tiếp vào tổng bill dịch vụ. Mã được áp dụng tại bước xem tóm tắt (sidebar) hoặc bước liên hệ trước khi xác nhận đặt cọc.

---

## Phân tích hiện trạng

### Backend — Promotions hiện có
- **Entity**: `Promotion` có: `Code`, `DiscountType` (1=%, 2=fixed, 3=BuyXGetY), `DiscountValue`, `MaxDiscountAmount`, `MinOrderValue`, `StartDate`, `EndDate`, `UsedCount`, `UsageLimit`, `Status`.
- **Endpoint hiện tại**: `GET /promotions`, `GET /promotions/{id}` — đều yêu cầu `[PermissionAuthorize]` → khách **không thể gọi được**.
- **`CreateAppointmentCommand`**: Không có trường `PromotionCode`. Handler tính `TotalAmount` từ service price rồi áp discount thẻ thành viên.
- **`Appointment` entity**: Không có trường `PromotionId`/`DiscountAmount`.

### Frontend — Booking Store
- `bookingStore.ts`: State gồm `guests`, `selectedSalon`, `contactInfo`. **Không có** state cho promotion.
- `BookingSummarySidebar.tsx`: Hiển thị tổng tiền nhưng **không có input mã khuyến mãi**.
- `BookingContactStep.tsx`: Bước cuối — gọi `createBooking(payload)` với `GuestAppointmentDto[]` **không có trường promotion**.
- `booking.api.ts`: Không có hàm validate/apply promotion code.

---

## Chiến lược

> **Áp dụng giảm giá phía Backend** — Frontend gửi `promotionCode` trong request tạo lịch. Handler backend validate code, tính `TotalAmount` sau giảm giá và lưu vào DB. Đây là cách an toàn và nhất quán nhất.

---

## Các thay đổi cụ thể

### Phase 1 — Backend

---

#### [MODIFY] `PromotionConst.cs`

Thêm message lỗi mới vào `#region Message`:

```csharp
public const string MSG_PROMOTION_EXPIRED     = "Mã khuyến mãi đã hết hạn.";
public const string MSG_PROMOTION_INACTIVE    = "Mã khuyến mãi không hoạt động.";
public const string MSG_PROMOTION_USAGE_LIMIT = "Mã khuyến mãi đã hết lượt sử dụng.";
public const string MSG_PROMOTION_MIN_ORDER   = "Giá trị đơn hàng chưa đạt mức tối thiểu để áp mã.";
```

Thêm ErrorCodes tương ứng vào `66SMS.Contracts/Enumerations/ErrorCodes.cs`.

---

#### [NEW] Query: `ValidatePromotionCode/`

**Path**: `Application/BookingService/Promotions/Queries/ValidatePromotionCode/`

**`ValidatePromotionCodeQuery.cs`**
```csharp
public class ValidatePromotionCodeQuery : IRequest<Result<PromotionValidationDto>>
{
    public string  Code       { get; set; } = null!;
    public decimal OrderTotal { get; set; }
}
```

**`PromotionValidationDto.cs`** — tạo trong `Application/DTOs/Promotions/`
```csharp
public class PromotionValidationDto
{
    public int?    Id             { get; set; }
    public string? Code           { get; set; }
    public string? Name           { get; set; }
    public int?    DiscountType   { get; set; }
    public decimal DiscountAmount { get; set; }  // Số tiền giảm thực tế
    public decimal FinalAmount    { get; set; }  // Tổng sau khi giảm
}
```

**`ValidatePromotionCodeHandler.cs`** — Logic:
1. Tìm promotion theo `Code` (Status == ACTIVE, không DELETED).
2. Validate thời hạn: `StartDate <= UtcNow <= EndDate`.
3. Validate lượt dùng: `UsageLimit == null || UsedCount < UsageLimit`.
4. Validate `MinOrderValue`: `OrderTotal >= MinOrderValue` nếu có.
5. Tính `DiscountAmount`:
   - **Type 1 (%)**: `min(OrderTotal × DiscountValue / 100, MaxDiscountAmount ?? ∞)`
   - **Type 2 (fixed)**: `DiscountValue`
   - **Type 3 (BuyXGetY)**: `0` (bỏ qua trong scope này)
6. Return `PromotionValidationDto` với `FinalAmount = OrderTotal - DiscountAmount`.

---

#### [MODIFY] `PromotionsController.cs`

Thêm endpoint công khai (AllowAnonymous) để validate mã:

```csharp
[HttpGet("validate")]
[AllowAnonymous]
public async Task<IActionResult> ValidateCode([FromQuery] ValidatePromotionCodeQuery query)
{
    var result = await mediator.Send(query);
    return HandleResult(result);
}
```

**Endpoint mới**: `GET /api/v1/promotions/validate?code=SUMMER20&orderTotal=500000`

---

#### [MODIFY] `CreateAppointmentCommand.cs`

```csharp
public class CreateAppointmentCommand : IRequest<Result<List<int>>>
{
    public int?    CreatedByUserId { get; set; }
    public string? PromotionCode  { get; set; }   // ← MỚI
    public List<GuestAppointmentDto> Guests { get; set; } = new();
}
```

---

#### [MODIFY] `CreateAppointmentHandler.cs`

Inject thêm `IPromotionSqlRepository`. Sau vòng lặp `foreach (var guest in request.Guests)`, **trước `transaction.Commit()`**, thêm:

```csharp
if (!string.IsNullOrWhiteSpace(request.PromotionCode))
{
    var promo = await promotionSqlRepository.AsQueryable()
        .Where(p => p.Code == request.PromotionCode
                 && p.Status == PromotionConst.STATUS_ACTIVE
                 && p.StartDate <= DateTime.UtcNow
                 && p.EndDate   >= DateTime.UtcNow)
        .FirstOrDefaultAsync(cancellationToken);

    if (promo == null)
        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_NOT_FOUND, ...);

    if (promo.UsageLimit.HasValue && promo.UsedCount >= promo.UsageLimit.Value)
        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_USAGE_LIMIT, ...);

    decimal grandTotal = /* tổng TotalAmount các appointment vừa tạo */;

    if (promo.MinOrderValue.HasValue && grandTotal < promo.MinOrderValue.Value)
        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_MIN_ORDER, ...);

    decimal discount = promo.DiscountType switch
    {
        PromotionConst.DISCOUNT_TYPE_PERCENT =>
            Math.Min(grandTotal * (promo.DiscountValue ?? 0) / 100m,
                     promo.MaxDiscountAmount ?? decimal.MaxValue),
        PromotionConst.DISCOUNT_TYPE_FIXED => promo.DiscountValue ?? 0m,
        _ => 0m
    };

    // Trừ discount vào Appointment đầu tiên (xem Open Questions)
    firstAppointment.TotalAmount -= discount;
    appointmentSqlRepository.Update(firstAppointment);

    promo.UsedCount++;
    promotionSqlRepository.Update(promo);
}
```

---

### Phase 2 — Frontend

---

#### [MODIFY] `booking.types.ts`

```typescript
export interface PromotionValidationDto {
  id: number | null;
  code: string | null;
  name: string | null;
  discountType: number | null;
  discountAmount: number;
  finalAmount: number;
}
```

---

#### [MODIFY] `bookingStore.ts`

```typescript
// Thêm vào BookingState interface
appliedPromotion: PromotionValidationDto | null;
promotionCode: string;
setPromotionCode: (code: string) => void;
setAppliedPromotion: (promo: PromotionValidationDto | null) => void;
clearPromotion: () => void;

// Thêm vào initialState
appliedPromotion: null,
promotionCode: '',

// Thêm actions
setPromotionCode: (code) => set({ promotionCode: code }),
setAppliedPromotion: (promo) => set({ appliedPromotion: promo }),
clearPromotion: () => set({ appliedPromotion: null, promotionCode: '' }),
```

Gọi `clearPromotion()` trong `resetBooking` và khi `selectService` thay đổi.

---

#### [MODIFY] `booking.api.ts`

```typescript
validatePromotion: async (code: string, orderTotal: number): Promise<PromotionValidationDto> => {
  const res = await axiosInstance.get<Result<PromotionValidationDto>>(
    `${API.promotions}/validate`,
    { params: { code, orderTotal } }
  );
  if (!res.data.isSuccess || !res.data.data)
    throw new Error(res.data.message ?? 'Mã không hợp lệ');
  return res.data.data;
},
```

---

#### [NEW] `PromotionCodeInput.tsx`

**Path**: `src/features/booking/components/PromotionCodeInput.tsx`

UI gồm:
- Input nhập mã + nút **"Áp dụng"** (loader khi đang gọi API).
- Nếu hợp lệ: badge xanh lá "✓ TÊN_MÃ — -X đ" + nút **× Xóa**.
- Nếu lỗi: text đỏ hiển thị message từ backend.

Logic:
```typescript
const handleApply = async () => {
  try {
    setLoading(true);
    setError('');
    const result = await bookingApi.validatePromotion(inputCode.toUpperCase(), total);
    setAppliedPromotion(result);
    setPromotionCode(inputCode.toUpperCase());
    toast.success('Áp dụng mã khuyến mãi thành công!');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Mã không hợp lệ');
    clearPromotion();
  } finally {
    setLoading(false);
  }
};
```

---

#### [MODIFY] `BookingSummarySidebar.tsx`

- Nhúng `<PromotionCodeInput />` vào footer (trên dòng Tổng cộng).
- Đọc `appliedPromotion` từ store.
- Hiển thị breakdown:

```
[PromotionCodeInput]
──────────────────────────────
Tổng dịch vụ:    500,000đ
Giảm giá (20%):  -100,000đ   ← chỉ hiện khi có promo
──────────────────────────────
Tổng cộng:       400,000đ
Cọc (20%):        80,000đ
```

---

#### [MODIFY] `BookingContactStep.tsx`

- Đọc `promotionCode` và `appliedPromotion` từ store.
- Sửa `createBooking` để nhận wrapper object:

```typescript
// booking.api.ts — thay GuestAppointmentDto[] thành:
export interface CreateBookingPayload {
  promotionCode?: string;
  guests: GuestAppointmentDto[];
}
```

Payload gửi lên backend:
```json
{
  "promotionCode": "SUMMER20",
  "guests": [{ ... }]
}
```

---

## Open Questions

> **[QUAN TRỌNG] Cách trừ discount khi có nhiều Appointment (multi-guest)?**
> - **Phương án A** *(đề xuất — đơn giản)*: Trừ toàn bộ discount vào `TotalAmount` của Appointment đầu tiên.
> - **Phương án B** *(công bằng hơn)*: Chia đều discount theo tỉ lệ giá trị vào từng Appointment.

> **[QUAN TRỌNG] Lưu PromotionId / DiscountAmount lên bảng `appointments` không?**
> - **Có**: Cần thêm cột `promotion_id` (INT NULL FK) và `discount_amount` (DECIMAL(18,2) NULL) ở SQL Server → cập nhật entity + const.
> - **Không**: Chỉ trừ thẳng vào `TotalAmount` — đơn giản hơn, mất khả năng truy vết.

> **[NOTE] BuyXGetY (DiscountType = 3)**: Bỏ qua trong scope này, mở rộng sau.

---

## Thứ tự thực thi

```
Phase 1 — Backend:
  1. (Optional) Thêm cột promotion_id, discount_amount vào SQL
  2. (Optional) Cập nhật Appointment.cs entity + AppointmentConst.cs
  3. Thêm messages vào PromotionConst.cs + ErrorCodes.cs
  4. Tạo PromotionValidationDto.cs
  5. Tạo ValidatePromotionCodeQuery.cs + ValidatePromotionCodeHandler.cs
  6. Thêm GET /promotions/validate [AllowAnonymous] vào PromotionsController.cs
  7. Sửa CreateAppointmentCommand.cs (thêm PromotionCode)
  8. Sửa CreateAppointmentHandler.cs (validate + apply + UsedCount++)
  9. Build: dotnet build src/66SMS.Application/66SMS.Application.csproj

Phase 2 — Frontend:
  1. Thêm PromotionValidationDto vào booking.types.ts
  2. Thêm validatePromotion() vào booking.api.ts
  3. Sửa bookingStore.ts (thêm promotion state/actions)
  4. Tạo PromotionCodeInput.tsx
  5. Sửa BookingSummarySidebar.tsx (nhúng input + breakdown giá)
  6. Sửa BookingContactStep.tsx (gửi promotionCode trong payload)
  7. npx tsc --noEmit
```

---

## Verification Plan

**Backend**:
- `GET /api/v1/promotions/validate?code=VALID&orderTotal=500000` → discount đúng, không cần auth.
- `GET /api/v1/promotions/validate?code=EXPIRED&orderTotal=500000` → 400 "Mã đã hết hạn".
- `GET /api/v1/promotions/validate?code=VALID&orderTotal=50000` (dưới MinOrderValue) → 400.
- `POST /api/v1/appointment` với `promotionCode` hợp lệ → `TotalAmount` giảm đúng, `UsedCount` +1.

**Frontend**:
- Nhập mã hợp lệ → badge xanh + tổng tiền cập nhật trong sidebar.
- Nhập mã sai/hết hạn → thông báo lỗi đỏ.
- Xóa mã → giá trở về ban đầu.
- Submit → lịch hẹn tạo thành công với giá đã giảm.
