import { useState } from 'react'
import { motion, type Variants } from 'motion/react'
import {
  Activity, Users, Send, BarChart2,
  Plus, Calendar, Clock, ArrowUpRight,
  UserCheck, Sparkles, RefreshCw
} from 'lucide-react'

// Sparkline generator helper
const generateSparklineD = (points: number[]) => {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  return points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100
    const y = 30 - ((p - min) / range) * 24 - 3 // Keep padding top/bottom
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}

const STATS = [
  { 
    label: 'Tổng khách hàng', 
    value: '12,450', 
    change: '+8.2%', 
    isPositive: true,
    trend: [30, 40, 35, 50, 45, 60, 55], 
    icon: Users, 
    color: 'text-lotus-rose', 
    bg: 'bg-lotus-rose-light'
  },
  { 
    label: 'Tin nhắn đã gửi', 
    value: '845,210', 
    change: '+12.4%', 
    isPositive: true,
    trend: [10, 20, 15, 30, 25, 45, 40], 
    icon: Send, 
    color: 'text-lotus-leaf', 
    bg: 'bg-lotus-leaf/10'
  },
  { 
    label: 'Tỷ lệ mở trung bình', 
    value: '45.2%', 
    change: '+1.5%', 
    isPositive: true,
    trend: [40, 42, 41, 44, 43, 46, 45], 
    icon: Activity, 
    color: 'text-lotus-gold', 
    bg: 'bg-lotus-gold/10'
  },
  { 
    label: 'Doanh thu tháng', 
    value: '45.2M', 
    change: '+15.3%', 
    isPositive: true,
    trend: [20, 25, 30, 28, 35, 42, 45], 
    icon: BarChart2, 
    color: 'text-lotus-deep', 
    bg: 'bg-lotus-cream'
  },
]

const ROOMS = [
  { name: 'Phòng VIP 1', type: 'Phòng VIP', status: 'occupied', service: 'Massage Đá Nóng', timeRemaining: 15, duration: 60, therapist: 'Nguyễn Thảo' },
  { name: 'Phòng VIP 2', type: 'Phòng VIP', status: 'available', service: '-', timeRemaining: 0, duration: 0, therapist: '-' },
  { name: 'Phòng 103', type: 'Phòng Thường', status: 'occupied', service: 'Chăm Sóc Da Mặt', timeRemaining: 35, duration: 90, therapist: 'Lê Mai' },
  { name: 'Phòng 104', type: 'Phòng Thường', status: 'cleaning', service: '-', timeRemaining: 0, duration: 0, therapist: '-' },
  { name: 'Phòng 105', type: 'Phòng Thường', status: 'available', service: '-', timeRemaining: 0, duration: 0, therapist: '-' },
  { name: 'Phòng 106', type: 'Phòng Thường', status: 'maintenance', service: '-', timeRemaining: 0, duration: 0, therapist: '-' },
]

const APPOINTMENTS = [
  { time: '14:30', client: 'Trần Thị Lan', service: 'Massage Cổ Vai Gáy', room: 'Phòng 103', therapist: 'Lê Mai', status: 'in-progress', statusText: 'Đang phục vụ' },
  { time: '15:00', client: 'Phạm Văn Minh', service: 'Massage Đá Nóng', room: 'Phòng VIP 1', therapist: 'Nguyễn Thảo', status: 'confirmed', statusText: 'Đã xác nhận' },
  { time: '15:30', client: 'Nguyễn Bích Vy', service: 'Facial Collagen', room: 'Phòng 105', therapist: 'Trần Vân', status: 'waiting', statusText: 'Đang đợi' },
  { time: '16:00', client: 'Lê Hoàng Nam', service: 'Gội Đầu Dưỡng Sinh', room: 'Phòng 104', therapist: 'Phạm Đạt', status: 'confirmed', statusText: 'Đã xác nhận' },
]

const CAMPAIGNS = [
  { name: 'Khuyến mãi T5 tri ân khách hàng', time: 'Hôm nay, 10:20 AM', successRate: '92%', sent: 1200, status: 'completed', statusText: 'Đã gửi' },
  { name: 'Chúc mừng sinh nhật tháng 6', time: 'Hôm nay, 08:00 AM', successRate: '98%', sent: 150, status: 'completed', statusText: 'Đã gửi' },
  { name: 'Giảm 20% khung giờ vàng 12h-14h', time: 'Hôm qua, 11:30 AM', successRate: '87%', sent: 3500, status: 'completed', statusText: 'Đã gửi' },
]

const THERAPISTS = [
  { name: 'Nguyễn Thảo', rating: '4.9 ★', status: 'busy', statusText: 'Đang làm', service: 'VIP 1 (Massage Đá Nóng)' },
  { name: 'Lê Mai', rating: '4.8 ★', status: 'busy', statusText: 'Đang làm', service: 'Phòng 103 (Chăm sóc da)' },
  { name: 'Trần Vân', rating: '4.7 ★', status: 'available', statusText: 'Sẵn sàng', service: 'Đang trống' },
  { name: 'Phạm Đạt', rating: '4.9 ★', status: 'break', statusText: 'Nghỉ ca', service: 'Nghỉ ca (15 phút)' },
]

const CHART_DATA = [
  { day: 'T2', sent: 12000, opened: 8500 },
  { day: 'T3', sent: 15000, opened: 11000 },
  { day: 'T4', sent: 18000, opened: 13000 },
  { day: 'T5', sent: 14000, opened: 9500 },
  { day: 'T6', sent: 22000, opened: 16000 },
  { day: 'T7', sent: 28000, opened: 21000 },
  { day: 'CN', sent: 25000, opened: 19000 },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  }
}

export function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7 ngày qua')
  
  // Responsive SVG calculation parameters
  const getX = (index: number) => 50 + (index / 6) * 500
  const getY = (val: number) => 210 - (val / 30000) * 170

  const sentLineD = CHART_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.sent)}`).join(' ')
  const sentAreaD = `${sentLineD} L ${getX(CHART_DATA.length - 1)} 210 L ${getX(0)} 210 Z`

  const openedLineD = CHART_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.opened)}`).join(' ')
  const openedAreaD = `${openedLineD} L ${getX(CHART_DATA.length - 1)} 210 L ${getX(0)} 210 Z`

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-20"
    >
      {/* Top Header & Action Row */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2 pb-4">
        <div>
          <h1 className="font-display italic text-3xl text-lotus-deep">Quản lý Spa</h1>
          <p className="font-sans text-lotus-stone text-sm mt-1">Thông số hoạt động tổng quan và báo cáo thời gian thực.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 h-11 bg-lotus-leaf text-white rounded-admin hover:bg-lotus-leaf/90 hover:shadow-lg transition-all duration-300 text-[13px] font-semibold">
            <Plus className="w-4 h-4" />
            Lịch hẹn mới
          </button>
          <button className="flex items-center gap-2 px-4 h-11 bg-lotus-rose-light text-lotus-rose rounded-admin hover:bg-lotus-rose-light/70 transition-all duration-300 text-[13px] font-semibold">
            <Sparkles className="w-4 h-4" />
            Chiến dịch mới
          </button>
          <button className="w-11 h-11 bg-white border border-stone-200/30 rounded-admin flex items-center justify-center hover:bg-lotus-cream transition-all duration-300">
            <RefreshCw className="w-4 h-4 text-lotus-gold" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards Section */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className={`card-glow bg-white/70 backdrop-blur-md rounded-admin p-5 border border-stone-200/30 flex flex-col justify-between h-[125px]`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-admin flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-lotus-leaf">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-3">
              <div>
                <p className="text-[11px] text-lotus-stone font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-lotus-deep tracking-tight mt-0.5">{stat.value}</p>
              </div>
              {/* Sparkline mini chart */}
              <svg className="w-16 h-8 text-lotus-gold shrink-0 opacity-80" viewBox="0 0 100 30">
                <path
                  d={generateSparklineD(stat.trend)}
                  fill="none"
                  stroke={i === 1 ? 'var(--lotus-leaf)' : i === 0 ? 'var(--lotus-rose)' : 'var(--lotus-gold)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Analysis Section */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Analytics & Room Grid (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SVG Analytics Chart Card */}
          <motion.div variants={itemVariants} className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-lotus-deep">Biểu đồ gửi tin & Tỷ lệ mở</h2>
                <p className="text-[12px] text-lotus-stone mt-0.5">Biểu diễn số lượng tin nhắn đã phân phối trong tuần.</p>
              </div>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-lotus-cream border-none text-xs text-lotus-deep rounded-admin px-3 py-2 font-medium focus:ring-1 focus:ring-lotus-gold outline-none cursor-pointer"
              >
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
                <option>Năm nay</option>
              </select>
            </div>

            {/* Premium Custom SVG Chart */}
            <div className="w-full h-[240px] relative mt-2">
              <svg className="w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--lotus-leaf)" stopOpacity="0.25"/>
                    <stop offset="95%" stopColor="var(--lotus-leaf)" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="gradientOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--lotus-gold)" stopOpacity="0.25"/>
                    <stop offset="95%" stopColor="var(--lotus-gold)" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines */}
                {[0, 5000, 10000, 15000, 20000, 25000, 30000].map((v) => (
                  <g key={v}>
                    <line 
                      x1="50" 
                      y1={getY(v)} 
                      x2="550" 
                      y2={getY(v)} 
                      stroke="var(--lotus-gold)" 
                      strokeOpacity="0.1" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x="40" 
                      y={getY(v) + 4} 
                      textAnchor="end" 
                      fill="var(--lotus-stone)" 
                      className="text-[10px] font-medium"
                    >
                      {v >= 1000 ? `${v/1000}k` : v}
                    </text>
                  </g>
                ))}

                {/* X-Axis labels & Grid lines */}
                {CHART_DATA.map((d, i) => (
                  <g key={i}>
                    <line 
                      x1={getX(i)} 
                      y1="40" 
                      x2={getX(i)} 
                      y2="210" 
                      stroke="var(--lotus-gold)" 
                      strokeOpacity="0.05" 
                    />
                    <text 
                      x={getX(i)} 
                      y="230" 
                      textAnchor="middle" 
                      fill="var(--lotus-stone)" 
                      className="text-[11px] font-semibold"
                    >
                      {d.day}
                    </text>
                  </g>
                ))}

                {/* Area paths */}
                <path d={sentAreaD} fill="url(#gradientSent)" />
                <path d={openedAreaD} fill="url(#gradientOpened)" />

                {/* Stroke lines */}
                <path 
                  d={sentLineD} 
                  fill="none" 
                  stroke="var(--lotus-leaf)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d={openedLineD} 
                  fill="none" 
                  stroke="var(--lotus-gold)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Data dots on hover/points */}
                {CHART_DATA.map((d, i) => (
                  <g key={i} className="group/dot cursor-pointer">
                    <circle 
                      cx={getX(i)} 
                      cy={getY(d.sent)} 
                      r="4" 
                      fill="white" 
                      stroke="var(--lotus-leaf)" 
                      strokeWidth="2.5" 
                    />
                    <circle 
                      cx={getX(i)} 
                      cy={getY(d.opened)} 
                      r="4" 
                      fill="white" 
                      stroke="var(--lotus-gold)" 
                      strokeWidth="2.5" 
                    />
                  </g>
                ))}
              </svg>
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center gap-6 mt-4 ml-10 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-lotus-leaf rounded-full" />
                <span className="text-lotus-deep">Tổng SMS Đã Gửi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-lotus-gold rounded-full" />
                <span className="text-lotus-deep">Tỉ Lệ Mở / Nhấp Link</span>
              </div>
            </div>
          </motion.div>

          {/* Room Occupancy Status Card */}
          <motion.div variants={itemVariants} className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-lotus-deep">Giám sát trạng thái phòng</h2>
                <p className="text-[12px] text-lotus-stone mt-0.5">Trạng thái phòng trị liệu thời gian thực.</p>
              </div>
              <span className="px-2.5 py-1 bg-lotus-gold/10 text-lotus-gold text-[11px] font-bold rounded-admin uppercase tracking-wider">
                6 phòng hoạt động
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ROOMS.map((room, i) => {
                const isOccupied = room.status === 'occupied'
                const isCleaning = room.status === 'cleaning'
                const isMaintenance = room.status === 'maintenance'
                
                let statusBg = 'bg-lotus-leaf/10 text-lotus-leaf border-lotus-leaf/20'
                let statusLabel = 'Đang trống'
                if (isOccupied) {
                  statusBg = 'bg-lotus-rose-light text-lotus-rose border-lotus-rose/20'
                  statusLabel = 'Đang dùng'
                } else if (isCleaning) {
                  statusBg = 'bg-lotus-gold/10 text-lotus-gold border-lotus-gold/20'
                  statusLabel = 'Dọn dẹp'
                } else if (isMaintenance) {
                  statusBg = 'bg-lotus-cream text-lotus-stone border-lotus-stone/20'
                  statusLabel = 'Bảo trì'
                }

                return (
                  <div 
                    key={i}
                    className={`p-4 rounded-admin border border-stone-200/30 bg-white/40 flex flex-col justify-between h-[135px] transition-all hover:shadow-md hover:bg-white/80`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-lotus-deep">{room.name}</h4>
                        <span className="text-[10px] text-lotus-stone font-medium">{room.type}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-admin text-[10px] font-bold border uppercase tracking-wider ${statusBg}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {isOccupied ? (
                      <div className="space-y-1.5 mt-2">
                        <div className="flex justify-between text-[11px] font-semibold text-lotus-deep">
                          <span className="truncate max-w-[100px]">{room.service}</span>
                          <span>{room.timeRemaining}p nữa</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-lotus-rose/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-lotus-rose h-full rounded-full transition-all duration-500" 
                            style={{ width: `${( (room.duration - room.timeRemaining) / room.duration ) * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-lotus-stone flex items-center gap-1.5 font-medium mt-1">
                          <UserCheck className="w-3 h-3 text-lotus-leaf" />
                          <span>KTV: {room.therapist}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-lotus-stone font-medium mt-4 flex items-center justify-center border border-dashed border-stone-200/30 rounded-admin p-3 bg-lotus-cream/30">
                        {isCleaning ? 'Đang dọn dẹp vệ sinh...' : isMaintenance ? 'Đang bảo dưỡng thiết bị...' : 'Sẵn sàng phục vụ'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

        </div>

        {/* Column 2: Today's Appointments, Campaign lists, Therapists (1/3 Width) */}
        <div className="space-y-6">
          
          {/* Today's Appointments agenda */}
          <motion.div variants={itemVariants} className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-lotus-deep">Lịch hẹn hôm nay</h2>
              <Calendar className="w-4 h-4 text-lotus-gold" />
            </div>

            <div className="space-y-3">
              {APPOINTMENTS.map((app, i) => {
                const isInProgress = app.status === 'in-progress'
                const isWaiting = app.status === 'waiting'
                let badgeStyle = 'bg-lotus-leaf/10 text-lotus-leaf border-lotus-leaf/20'
                if (isInProgress) {
                  badgeStyle = 'bg-lotus-rose-light text-lotus-rose border-lotus-rose/20'
                } else if (isWaiting) {
                  badgeStyle = 'bg-lotus-gold/10 text-lotus-gold border-lotus-gold/20'
                }

                return (
                  <div key={i} className="flex gap-3 p-3 rounded-admin bg-white/40 border border-stone-200/30 hover:bg-white/80 transition-colors">
                    <div className="flex flex-col items-center justify-center shrink-0 w-12 border-r border-stone-200/50 pr-2">
                      <Clock className="w-3.5 h-3.5 text-lotus-gold mb-0.5" />
                      <span className="text-[12px] font-bold text-lotus-deep">{app.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-semibold text-xs text-lotus-deep truncate">{app.client}</h4>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border rounded-admin ${badgeStyle} shrink-0`}>
                          {app.statusText}
                        </span>
                      </div>
                      <p className="text-[11px] text-lotus-deep/80 font-medium truncate mt-0.5">{app.service}</p>
                      <div className="flex justify-between text-[10px] text-lotus-stone mt-1.5">
                        <span>{app.room}</span>
                        <span className="font-semibold text-lotus-leaf">KTV: {app.therapist}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Therapist Log and duty status */}
          <motion.div variants={itemVariants} className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-lotus-deep">Kỹ thuật viên trực ca</h2>
              <span className="text-xs font-semibold text-lotus-leaf flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-lotus-leaf" />
                4 nhân sự
              </span>
            </div>

            <div className="space-y-3">
              {THERAPISTS.map((therapist, i) => {
                const isBusy = therapist.status === 'busy'
                const isBreak = therapist.status === 'break'
                
                let dotStyle = 'bg-lotus-leaf'
                let textStyle = 'text-lotus-leaf'
                if (isBusy) {
                  dotStyle = 'bg-lotus-rose'
                  textStyle = 'text-lotus-rose'
                } else if (isBreak) {
                  dotStyle = 'bg-lotus-gold'
                  textStyle = 'text-lotus-gold'
                }

                return (
                  <div key={i} className="flex items-center justify-between border-b border-stone-100 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-lotus-deep">{therapist.name}</span>
                        <span className="text-[10px] text-lotus-gold font-bold">{therapist.rating}</span>
                      </div>
                      <p className="text-[10px] text-lotus-stone mt-0.5 truncate max-w-[180px]">{therapist.service}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
                      <span className={`text-[11px] font-semibold uppercase ${textStyle}`}>{therapist.statusText}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Campaign stats with progress bars */}
          <motion.div variants={itemVariants} className="card-glow bg-white/70 backdrop-blur-md rounded-admin p-6 border border-stone-200/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-lotus-deep">Chiến dịch gần đây</h2>
              <Send className="w-4 h-4 text-lotus-rose" />
            </div>

            <div className="space-y-4">
              {CAMPAIGNS.map((cam, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-lotus-deep hover:text-lotus-leaf transition-colors cursor-pointer line-clamp-1">{cam.name}</h4>
                      <p className="text-[10px] text-lotus-stone mt-0.5">{cam.time}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-lotus-leaf/10 text-lotus-leaf text-[9px] font-bold rounded-admin uppercase shrink-0">
                      {cam.statusText}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-lotus-leaf/10 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-lotus-leaf h-full rounded-full" 
                        style={{ width: cam.successRate }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-lotus-deep shrink-0">{cam.successRate} thành công ({cam.sent})</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </motion.div>

    </motion.div>
  )
}
