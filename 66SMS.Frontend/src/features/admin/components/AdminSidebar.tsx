import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  ChevronDown,
  Send,
  History,
  FileText,
  Calendar,
  SoapDispenserDroplet,
  Stethoscope,
  CalendarHeart,
  Clock,
  Leaf,
  Armchair
} from 'lucide-react'
import { Logo } from '@/shared/components/Logo'

// Simplified role check for UI mockup
// In production, import { useRole } from '@/features/auth'
const useRole = () => ({ isAdmin: true, isEmployee: true, isReceptionist: true })

interface SubMenuItem {
  label: string
  path: string
  icon?: React.ElementType
}

interface MenuItem {
  label: string
  path?: string
  icon: React.ElementType
  children?: SubMenuItem[]
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
  { label: 'Phòng', path: '/admin/rooms', icon: Armchair },
  {
    label: 'Dịch vụ', icon: Leaf,
    children: [
      { label: 'Dịch vụ', path: '/admin/services', icon: Leaf },
      { label: 'Sản phẩm', path: '/admin/products', icon: SoapDispenserDroplet },
    ],
  },
  {
    label: 'Quản lý Spa', icon: MessageSquare,
    children: [
      { label: 'Đặt lịch hẹn', path: '/admin/appointments', icon: Send },
      { label: 'Liệu trình', path: '/admin/treatments', icon: History },
      { label: 'Gói dịch vụ', path: '/admin/packages', icon: FileText },
    ],
  },
  { label: 'Nhân viên', path: '/admin/staff/list', icon: Stethoscope },
  {
    label: 'Lịch làm việc', icon: Calendar,
    children: [
      { label: 'Phân ca', path: '/admin/staff/schedule', icon: Calendar },
      { label: 'Quản lý ca', path: '/admin/shifts', icon: Clock },
    ],
  },
  { label: 'Lịch hẹn của tôi', path: '/admin/staff/appointments', icon: CalendarHeart },
  { label: 'Khách hàng', path: '/admin/customers/list', icon: Users },
]

interface AdminSidebarProps {
  isOpen: boolean
  isMobileOpen: boolean
  setMobileOpen: (val: boolean) => void
}

export function AdminSidebar({ isOpen, isMobileOpen, setMobileOpen }: AdminSidebarProps) {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const { isAdmin, isEmployee, isReceptionist } = useRole()

  const visibleMenuItems = MENU_ITEMS // Mocked for now, apply filtering in production if needed

  const toggleMenu = (label: string) => {
    if (!isOpen) return
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const checkIsActive = (path?: string, children?: SubMenuItem[]) => {
    if (path && location.pathname === path) return true
    if (children) return children.some((child) => location.pathname === child.path)
    return false
  }

  return (
    <>
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-lotus-deep/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        layout
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-lotus-cream/95 backdrop-blur-md border-r border-lotus-gold/20 shadow-xl transition-all duration-500 ease-out ${isOpen ? 'w-64' : 'w-20'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`h-20 flex items-center shrink-0 px-4 border-b border-lotus-gold/20 overflow-hidden transition-all duration-500 ${isOpen ? 'justify-start' : 'justify-center'}`}>
          <Logo variant="dark" size={isOpen ? 'md' : 'sm'} showTagline={false} className={!isOpen ? "[&>div:last-child]:hidden" : ""} />
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 hide-scrollbar">
          <ul className="space-y-2">
            <AnimatePresence>
              {visibleMenuItems.map((item, index) => {
                const isActive = checkIsActive(item.path, item.children)
                const isExpanded = openMenus[item.label] || (isActive && isOpen)
                const Icon = item.icon

                return (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.children ? (
                      <div className="space-y-1">
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 group relative ${isActive ? 'bg-lotus-leaf text-white shadow-md' : 'text-lotus-deep/70 hover:bg-lotus-leaf/10 hover:text-lotus-deep'} ${!isOpen ? 'justify-center' : ''}`}
                          title={!isOpen ? item.label : undefined}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Icon className={`w-[1.125rem] h-[1.125rem] shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                            {isOpen && <span className="font-sans font-medium text-[13px] tracking-wide whitespace-nowrap">{item.label}</span>}
                          </div>
                          {isOpen && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          )}
                        </button>

                        <AnimatePresence>
                          {isOpen && isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <ul className="pl-9 pr-2 space-y-1 py-1 relative before:content-[''] before:absolute before:left-[1.35rem] before:top-2 before:bottom-2 before:w-px before:bg-lotus-leaf/20">
                                {item.children.map((child) => {
                                  const isChildActive = location.pathname === child.path
                                  const ChildIcon = child.icon
                                  return (
                                    <li key={child.path}>
                                      <Link
                                        to={child.path}
                                        className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs transition-all duration-300 relative ${isChildActive ? 'text-lotus-leaf font-semibold bg-lotus-leaf/10 before:content-[""] before:absolute before:-left-[1.35rem] before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-lotus-leaf' : 'text-lotus-deep/60 hover:text-lotus-deep hover:bg-lotus-leaf/5'}`}
                                      >
                                        {ChildIcon && <ChildIcon className="w-3.5 h-3.5 shrink-0" />}
                                        <span className="whitespace-nowrap">{child.label}</span>
                                      </Link>
                                    </li>
                                  )
                                })}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.path!}
                        className={`flex items-center p-3 rounded-2xl transition-all duration-300 group relative ${isActive ? 'bg-lotus-leaf text-white shadow-md' : 'text-lotus-deep/70 hover:bg-lotus-leaf/10 hover:text-lotus-deep'} ${!isOpen ? 'justify-center' : 'gap-3'}`}
                        title={!isOpen ? item.label : undefined}
                      >
                        <Icon className={`w-[1.125rem] h-[1.125rem] shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                        {isOpen && <span className="font-sans font-medium text-[13px] tracking-wide whitespace-nowrap">{item.label}</span>}
                        {!isOpen && (
                          <div className="absolute left-full ml-4 px-3 py-1.5 bg-lotus-deep text-lotus-cream text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    )}
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        </div>
      </motion.aside>
    </>
  )
}
