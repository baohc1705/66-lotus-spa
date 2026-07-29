# 66SMS.Frontend

## Tổng quan
Phần frontend của hệ thống quản lý spa 66SMS, xây dựng bằng React + TypeScript, đóng gói bằng Vite.

## Công nghệ sử dụng

| Mục đích | Thư viện |
| --- | --- |
| UI framework | React 19 + TypeScript |
| Build tool | Vite |
| State management (client) | Zustand |
| State management (server) | TanStack Query (React Query) |
| Form | React Hook Form + Zod (validation) |
| HTTP client | Axios |
| Routing | React Router DOM v7 |
| UI components | shadcn/ui (Radix primitives) + Tailwind CSS |
| Animation | Framer Motion |
| Toast | Sonner |

## Cấu trúc thư mục

| Thư mục | Vai trò |
| --- | --- |
| src/app | Router, providers (QueryProvider, v.v.) |
| src/features | Các module nghiệp vụ, mỗi feature một thư mục riêng |
| src/shared | Component, hook, util, constant dùng chung toàn app |
| src/lib | Hàm tiện ích nhỏ (cn, helper) |
| src/styles | File CSS gốc (Tailwind, tokens, admin theme) |

## Tổ chức theo Feature

Mỗi feature nằm trong src/features/[tên]/ và có cấu trúc giống nhau:

| Thư mục con | Chứa gì |
| --- | --- |
| api/ | Gọi API (axios), mỗi feature một file api riêng |
| hooks/ | Custom hook (TanStack Query mutation/query, state logic) |
| components/ | Component UI của feature đó |
| pages/ | Trang (page) được gắn vào router |
| types/ | TypeScript interface/type cho DTO |
| schemas/ | Zod schema cho form validation |
| constants/ | Hằng số, permission key |
| stores/ | Zustand store (nếu cần state riêng) |

## Danh sách feature chính

| Feature | Chức năng |
| --- | --- |
| auth | Đăng nhập, đăng ký, quên mật khẩu, OTP, role/permission |
| booking | Đặt lịch khách hàng (landing), stepper multi-step |
| cashier | Thu ngân: timeline, POS, tạo hóa đơn, thanh toán |
| customers | Quản lý khách hàng, thẻ thành viên, ví điểm |
| staffs | Quản lý nhân viên, phân công dịch vụ |
| services | Dịch vụ và nhóm dịch vụ |
| products | Sản phẩm và danh mục sản phẩm |
| invoices | Hóa đơn |
| attendance | Chấm công |
| schedules | Lịch làm việc |
| shifts | Ca làm |
| payroll | Bảng lương |
| revenue | Dashboard doanh thu, biểu đồ, xuất Excel |
| salons | Chi nhánh |
| promotions | Khuyến mãi |
| certificates | Chứng chỉ nhân viên |
| landing | Trang chủ công khai (giới thiệu spa) |
| profile | Trang cá nhân (khách + admin) |
| admin | Layout admin, sidebar, top navbar, phân quyền menu |

## Quản lý state

- Zustand: dùng cho state client (auth store, booking store)
- TanStack Query: dùng cho mọi data từ server (tự cache, refetch, invalidate)
- React Hook Form: state form cục bộ, kết hợp Zod để validate

## Giao tiếp API

- Axios instance chung nằm ở src/shared/api/axiosInstance.ts
- Base URL lấy từ biến môi trường VITE_API_BASE_URL
- Endpoint tập trung ở src/shared/api/endpoints.ts
- Mỗi feature có file api riêng, gọi axios rồi trả Result<T>

## Phân quyền

- PermissionGate component bọc UI theo quyền
- usePermission hook kiểm tra quyền/role của user đang đăng nhập
- Menu sidebar tự lọc theo role (useMenuByRole)

## Cách chạy

1. Cài thư viện:
   - `npm install`
2. Tạo file .env.local:
   - `VITE_API_BASE_URL=https://localhost:7000/api/v1`
3. Chạy dev server:
   - `npm run dev`
4. Build production:
   - `npm run build`

Dev server chạy tại http://localhost:5173
