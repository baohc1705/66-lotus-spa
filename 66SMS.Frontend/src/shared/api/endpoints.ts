// Tập trung toàn bộ URL API vào đây.
// Khi backend thay đổi endpoint → chỉ cần sửa ở file này.

export const API = {
  auth: {
    login:            '/auth/login',
    logout:           '/auth/logout',
    refreshToken:     '/auth/refresh-token',
    register:         '/auth/register',
    forgotPassword:   '/auth/forgot-password',
    resetPassword:    '/auth/reset-password',
    changePassword:   '/auth/change-password',
    sendOtp:          '/auth/send-otp',
    verifyOtp:        '/auth/verify-otp',
    role:             '/auth/role',
    roleAssign:       '/auth/role/assign-permisison',
    permission:       '/auth/permission',
  },
  users: {
    base:             '/users',
    me:               '/users/me',
    meMembershipCard: '/users/me/membership-card',
    meWallet:         '/users/me/wallet',
    meWalletTx:       '/users/me/wallet/transactions',
  },
  staffs: {
    base:             '/staffs',
  },
  customers:          '/customer',
  products:           '/Product',
  productCategories:  '/ProductCategory',
  services:           '/Service',
  serviceCategories:  '/ServiceCategory',
  shifts:             '/Shift',
  timeSlots:          '/TimeSlots',
  bookingPositions:   '/BookingPositions',
  bookingRooms:       '/BookingRooms',
  appointment:        '/Appointment',
  workSchedule:       '/WorkerSchedule',
  salons:             '/Salons',
  staffSalons:        '/StaffSalons',
  meSalon:            '/Me/salon',
  membershipTiers:    '/membershiptiers',
  membershipCards:    '/membershipcards',
  cashier: {
    daily:            '/cashier/daily',
    onlineAppointments: '/cashier/online-appointments',
    appointment:      '/cashier/appointments',
    vnpayCreate:      '/cashier/vnpay/create-url',
    vnpayReturn:      '/cashier/vnpay-return',
  },
  admin: {
    wallets:          '/admin/wallets',
  },
  address: {
    provinces:        '/address/provinces',
    wards:            '/address/wards',
  },
  media: {
    image:            '/media/image',
    images:           '/media/images',
  },
} as const
