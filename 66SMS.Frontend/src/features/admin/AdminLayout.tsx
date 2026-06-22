import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminHeader } from './components/AdminHeader'
import { motion } from 'motion/react'

import { usePermission } from '@/shared/hooks/usePermission'
import { useAuthStore } from '@/features/auth/stores/authStore'

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const { hasRole } = usePermission()
  const user = useAuthStore((s) => s.user)
  const isCustomer = hasRole('Customer')
  const hasAccess = !!user && !isCustomer

  // Redirect user không có quyền vào admin
  useEffect(() => {
    if (!hasAccess) {
      navigate('/')
    }
  }, [hasAccess, navigate])

  // Staff / Receptionist không có Dashboard → redirect về "Lịch hẹn của tôi"
  const isStaffOrReceptionist =
    (hasRole('Staff') || hasRole('Receptionist')) && !hasRole('Admin') && !hasRole('Manager')

  useEffect(() => {
    if (hasAccess && isStaffOrReceptionist && location.pathname === '/admin') {
      navigate('/admin/staff/appointments', { replace: true })
    }
  }, [hasAccess, isStaffOrReceptionist, location.pathname, navigate])

  if (!hasAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2] font-sans text-[#2A1F1A] overflow-clip flex selection:bg-lotus-rose-light selection:text-lotus-rose">
      {/* Decorative Background Elements for Luxury Feel */}
      <div className="fixed top-0 left-0 w-[50vw] h-[50vw] rounded-full bg-lotus-rose/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-lotus-gold/5 blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setIsMobileSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ease-out z-10 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
      >
        <AdminHeader
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-2 sm:p-2 lg:p-4 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className=" mx-auto w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
