# 66SMS - Hệ thống quản lý spa

## Giới thiệu chung
66SMS là hệ thống quản lý spa nhằm hỗ trợ việc đặt lịch, quản lý nhân viên và dịch vụ, xử lý hóa đơn, và một số màn hình thống kê cho quản trị.

## Các chức năng chính

| Mảng | Làm được những gì |
| --- | --- |
| Đặt lịch | Tạo và quản lý lịch hẹn, gán nhân viên, cập nhật trạng thái |
| Khách hàng & Nhân viên | Quản lý thông tin khách hàng, nhân viên, vai trò và phân công dịch vụ |
| Dịch vụ | Quản lý nhóm dịch vụ và danh mục thông tin dịch vụ |
| Chấm công | Theo dõi chấm công theo ngày/ca và các thao tác điều chỉnh cần thiết |
| Thu ngân & Hóa đơn | Tạo hóa đơn, cập nhật thanh toán và trạng thái |
| Thống kê doanh thu | Xem tổng quan, xu hướng và xuất báo cáo (phần admin) |

## Công nghệ sử dụng

| Phần | Công nghệ |
| --- | --- |
| Backend | .NET 8, Clean Architecture, CQRS (MediatR), EF Core (Database First) |
| Frontend | React + TypeScript, TanStack Query, Zustand, React Hook Form + Zod |
| UI | Tailwind CSS |

## Kiến trúc backend (Clean Architecture)

| Lớp | Nội dung chính |
| --- | --- |
| Contract | DTO dùng chung, interface và Result<T> |
| Domain | Entity và logic nền tảng của nghiệp vụ |
| Application | CQRS handler và validator |
| Infrastructure | Tích hợp bên ngoài (JWT, email, VNPay, ...) |
| Persistence | DbContext, repository và truy cập dữ liệu |
| API | Controller và phần đăng ký DI |

## Cách chạy dự án

## Chạy backend (API)

1. Vào thư mục backend:
   - `cd 66SMS.Backend`
2. Build:
   - `dotnet build 66SMS.Backend.sln`
3. Chạy API (Swagger có sẵn):
   - `dotnet run --project src/66SMS.API`

Swagger:
 - `https://localhost:7000/swagger` (tùy máy bạn)

## Cấu hình Database
- Dự án dùng hướng Database First, nên bạn cần có sẵn database.
- Tạo `appsettings.Development.json` (file này thường không commit) và điền:
  - `ConnectionStrings.SqlServerConn`
  - `JwtSettings`
  - `MailSettings`
  - `VnPaySettings`
  - `CorsSettings.AllowedOrigins`

## Chạy frontend (React)

1. Vào thư mục frontend:
   - `cd 66SMS.Frontend`
2. Cài thư viện:
   - `npm install`
3. Chạy dev server:
   - `npm run dev`

URL chạy:
 - `http://localhost:5173`

Biến môi trường:
- Tạo `.env.local` và set:
  - `VITE_API_BASE_URL=https://localhost:7000/api/v1`

