# 66SMS.Backend
Inspired by 365Architect: https://365sharing.org/guide/chia-se-bo-source-code-ung-dung-mo-hinh-microservices-thuc-te-tai-website-365sharing-i-110
## Tổng quan
Phần backend của hệ thống quản lý spa 66SMS, xây dựng trên .NET 8 theo kiến trúc Clean Architecture kết hợp CQRS pattern.
Kiến trúc Clean Architecture tập trung chính vào giải quyết **DDD (Domain Driven Design)** và khả năng mở rộng.

## Cấu trúc Solution

| Project | Vai trò |
| --- | --- |
| 66SMS.API | Lớp trình bày - chứa Controller, middleware, cấu hình DI và Program.cs |
| 66SMS.Application | Lớp nghiệp vụ - chứa Command/Query handler (MediatR), validator (FluentValidation), DTO và AutoMapper |
| 66SMS.Domain | Lớp domain - chứa Entity, enum, hằng số nghiệp vụ và interface repository |
| 66SMS.Infrastructure | Lớp hạ tầng - tích hợp JWT, Argon2, MailKit, VNPay |
| 66SMS.Persistence | Lớp truy cập dữ liệu - DbContext, repository triển khai, cấu hình EF Core |
| 66SMS.Contract | Lớp chia sẻ - DTO dùng chung, interface, setting class, Result<T> |

## Hướng phụ thuộc

API -> Application -> Domain <- Infrastructure <- Persistence

- API phụ thuộc vào Application
- Application phụ thuộc vào Domain (và Contract)
- Infrastructure và Persistence phụ thuộc ngược vào Domain (Dependency Inversion)
- Domain không phụ thuộc vào bất kỳ project nào khác

## CQRS Pattern

Mỗi chức năng nằm trong thư mục riêng theo cấu trúc:

- Application/Features hoặc Application/[ServiceName]/[Entity]/Commands/[TênThaoTác]/
  - [Tên]Command.cs - định nghĩa request
  - [Tên]Validator.cs - validate input bằng FluentValidation
  - [Tên]Handler.cs - xử lý nghiệp vụ, trả về Result<T>

- Application/[ServiceName]/[Entity]/Queries/[TênThaoTác]/
  - [Tên]Query.cs - định nghĩa request
  - [Tên]Handler.cs - xử lý truy vấn

## Repository Pattern

- IGenericSqlRepository<TEntity, TKey> là base chung cho CRUD
- Các repository cụ thể mở rộng thêm method riêng (IUserSqlRepository, ICustomerSqlRepository, ...)
- ISqlUnitOfWork dùng để commit transaction
- Tất cả đăng ký scoped trong Persistence/DependencyInjection

## Response chung - Result<T>

Tất cả handler trả về Result<T> (nằm trong Contract/Shared/Result.cs) với các factory method:
- Result.Success()
- Result.Created()
- Result.BadRequest()
- Result.NotFound()
- Result.Conflict()
- Result.Unauthorized()

## Nhóm nghiệp vụ chính (trong Application)

| Nhóm | Chức năng |
| --- | --- |
| IdentityService | Auth (login, register, OTP, reset password), User, Role, Permission |
| BookingService | Appointment, TimeSlot, Shift, WorkSchedule, BookingRoom, BookingPosition, Cashier |
| CatalogService | Service, ServiceCategory, Product, ProductCategory, TreatmentCourse |
| CustomerService | Customer, MembershipTier, MembershipCard, Wallet |
| SalonService | Salon, Staff, StaffSalon, Attendance, Payroll, Revenue, Certificate |

## Database

- Dùng Database First (không tạo migration từ code)
- SQL Server với tên database: 66LotusSpaDB
- Stored procedure nằm trong thư mục scripts/store_procedure

## Cách chạy

1. Cấu hình appsettings.Development.json (không commit):
   - ConnectionStrings.SqlServerConn
   - JwtSettings (SecretKey, Issuer, Audience, thời gian hết hạn token)
   - MailSettings (SMTP Gmail)
   - VnPaySettings (sandbox)
   - CorsSettings.AllowedOrigins (thêm http://localhost:5173)

2. Build và chạy:
   - `dotnet build 66SMS.Backend.sln`
   - `dotnet run --project src/66SMS.API`

3. Swagger UI:
   - https://localhost:7000/swagger

## API Versioning
Tất cả endpoint đều có prefix /api/v1.
