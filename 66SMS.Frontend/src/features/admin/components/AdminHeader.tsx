import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, ShoppingBag, ShoppingCart, Bell, HelpCircle, Settings, User, ChevronDown, LogOut } from 'lucide-react'

// Mocking useRole and useLogout for layout testing
const useRole = () => ({ isAdmin: true, isReceptionist: true })
const useLogout = () => ({ mutate: () => console.log('Logout'), isPending: false })
const useProfile = () => ({ data: { fullName: 'Admin Spa', email: 'admin@hoasenspa.com' } })

interface AdminHeaderProps {
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
}

export function AdminHeader({ toggleSidebar, toggleMobileSidebar }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const { isAdmin, isReceptionist } = useRole()
  const { data: profile } = useProfile()

  return (
    <header className="h-20 bg-lotus-cream/80 backdrop-blur-xl border-b border-lotus-gold/20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-12 h-12 rounded-2xl bg-lotus-leaf/5 text-lotus-leaf items-center justify-center hover:bg-lotus-leaf hover:text-white hover:shadow-lg hover:shadow-lotus-leaf/20 transition-all duration-300"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden w-12 h-12 rounded-2xl bg-lotus-leaf/5 text-lotus-leaf flex items-center justify-center hover:bg-lotus-leaf hover:text-white transition-all duration-300"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {isAdmin && (
          <button className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-white/60 text-lotus-deep border border-lotus-gold/20 hover:border-lotus-gold hover:bg-lotus-cream hover:shadow-md transition-all duration-300 font-medium text-[13px] tracking-wide">
            <ShoppingBag className="w-[1.125rem] h-[1.125rem] text-lotus-gold" />
            <span className="hidden sm:inline">Bán online</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
        )}

        {(isAdmin || isReceptionist) && (
          <Link to="/thu-ngan" className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-white/60 text-lotus-deep border border-lotus-gold/20 hover:border-lotus-gold hover:bg-lotus-cream hover:shadow-md transition-all duration-300 font-medium text-[13px] tracking-wide">
            <ShoppingCart className="w-[1.125rem] h-[1.125rem] text-lotus-leaf" />
            <span className="hidden sm:inline">Thu ngân</span>
          </Link>
        )}

        <div className="flex items-center gap-2 ml-2">
          <button className="w-12 h-12 rounded-2xl bg-white/60 text-lotus-deep border border-lotus-gold/20 flex items-center justify-center hover:border-lotus-gold hover:bg-lotus-cream hover:shadow-md transition-all duration-300 relative group">
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-lotus-rose border-2 border-white" />
          </button>

          {isAdmin && (
            <button className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/60 text-lotus-deep border border-lotus-gold/20 items-center justify-center hover:border-lotus-gold hover:bg-lotus-cream hover:shadow-md transition-all duration-300 group">
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          )}

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-12 h-12 rounded-2xl bg-lotus-leaf text-white flex items-center justify-center hover:bg-lotus-leaf/90 hover:shadow-lg hover:shadow-lotus-leaf/20 transition-all duration-300 ml-1 border border-lotus-leaf"
            >
              <User className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(42,31,26,0.1)] py-3 z-50 border border-lotus-gold/20"
                  >
                    <div className="px-5 py-3 border-b border-lotus-gold/10 mb-2">
                      <p className="text-[15px] font-semibold text-lotus-deep">{profile?.fullName || 'Tài khoản'}</p>
                      <p className="text-[13px] text-lotus-stone truncate">{profile?.email || ''}</p>
                    </div>
                    <Link to="/admin/profile" className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-deep/70 hover:bg-lotus-cream hover:text-lotus-leaf transition-colors">
                      <User className="w-4 h-4" />
                      Hồ sơ cá nhân
                    </Link>
                    <Link to="/admin/profile" className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-deep/70 hover:bg-lotus-cream hover:text-lotus-leaf transition-colors">
                      <Settings className="w-4 h-4" />
                      Cài đặt tài khoản
                    </Link>
                    <div className="h-px bg-lotus-gold/10 my-2" />
                    <button 
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-lotus-rose hover:bg-lotus-rose/5 disabled:opacity-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
