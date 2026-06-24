import { User, Wallet, Bell, LogOut, Calendar, Award, ShieldCheck, Lock } from 'lucide-react'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useNavigate } from 'react-router-dom'

interface ProfileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isCustomer?: boolean
}

export function ProfileSidebar({ activeTab, onTabChange, isCustomer = false }: ProfileSidebarProps) {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const menuItems = [
    ...(isCustomer ? [{ id: 'membership', label: 'Hạng thành viên', icon: Award }] : []),
    { id: 'bookings', label: 'Lịch hẹn', icon: Calendar },
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'account', label: 'Tài khoản', icon: ShieldCheck },
    { id: 'change-password', label: 'Đổi mật khẩu', icon: Lock },
    { id: 'wallet', label: 'Ví của tôi', icon: Wallet },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ]

  return (
    <div className="w-full lg:w-64 space-y-2">
      <div className="bg-white rounded-b-2xl rounded-t-none p-4 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-lotus-rose/80 via-lotus-rose/70 to-lotus-gold/80" />
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-lotus-rose-light text-lotus-rose shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-lotus-rose' : 'text-gray-400'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-[var(--spa-border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}
