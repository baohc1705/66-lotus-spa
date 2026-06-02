import { motion } from 'motion/react'
import { Activity, Users, Send, BarChart2 } from 'lucide-react'

const STATS = [
  { label: 'Tổng khách hàng', value: '12,450', icon: Users, color: 'text-lotus-rose', bg: 'bg-lotus-rose-light', border: 'border-lotus-rose/20' },
  { label: 'Tin nhắn đã gửi', value: '845,210', icon: Send, color: 'text-lotus-leaf', bg: 'bg-lotus-leaf/10', border: 'border-lotus-leaf/20' },
  { label: 'Tỷ lệ mở trung bình', value: '45.2%', icon: Activity, color: 'text-lotus-gold', bg: 'bg-lotus-gold/10', border: 'border-lotus-gold/20' },
  { label: 'Doanh thu tháng', value: '45.2M', icon: BarChart2, color: 'text-lotus-deep', bg: 'bg-lotus-cream', border: 'border-lotus-deep/10' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
}

export function AdminDashboard() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-20"
    >
      <motion.div variants={itemVariants} className="pt-2 pb-4">
        <h1 className="font-display italic text-3xl text-lotus-deep">Quản lý Spa</h1>
        <p className="font-sans text-lotus-stone text-sm mt-1">Tổng quan hoạt động kinh doanh hôm nay.</p>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className={`card-glow bg-white/70 backdrop-blur-md rounded-[2rem] p-6 border ${stat.border} flex items-center gap-5`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[13px] text-lotus-stone font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-lotus-deep tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <motion.div variants={itemVariants} className="lg:col-span-2 card-glow bg-white/70 backdrop-blur-md rounded-[2rem] p-8 border border-lotus-gold/20 min-h-[420px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-lotus-deep">Biểu đồ gửi tin</h2>
            <select className="bg-lotus-cream border-none text-sm text-lotus-deep rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-lotus-gold outline-none cursor-pointer">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>Năm nay</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center bg-lotus-cream/50 rounded-2xl border border-dashed border-lotus-gold/30">
            <p className="text-lotus-stone font-medium text-sm">Khu vực hiển thị biểu đồ</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-glow bg-white/70 backdrop-blur-md rounded-[2rem] p-8 border border-lotus-gold/20 min-h-[420px]">
          <h2 className="font-display text-2xl font-semibold text-lotus-deep mb-6">Chiến dịch gần đây</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="group flex items-center justify-between border-b border-lotus-gold/10 pb-4 last:border-0 last:pb-0 hover:bg-lotus-cream/50 p-3 -mx-3 rounded-2xl transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-lotus-deep group-hover:text-lotus-leaf transition-colors">Khuyến mãi T5 #{i}</p>
                  <p className="text-[12px] text-lotus-stone mt-1">Hôm nay, 10:20 AM</p>
                </div>
                <span className="px-3 py-1.5 bg-lotus-leaf/10 text-lotus-leaf text-[11px] font-bold rounded-xl uppercase tracking-wider">
                  Đã gửi
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
