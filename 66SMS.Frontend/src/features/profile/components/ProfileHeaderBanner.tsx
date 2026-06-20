import { Calendar, Award, CreditCard, Sparkles, User as UserIcon } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'
import { useMyMembershipCard, useMembershipTiers } from '../hooks/useMembershipInfo'
import type { UserDto } from '@/features/users/types/user.types'

interface ProfileHeaderBannerProps {
  profile?: UserDto
}

export function ProfileHeaderBanner({ profile }: ProfileHeaderBannerProps) {
  const isCustomer = profile?.profileType === 'Customer'
  
  // Call hooks conditionally (React Query will handle query key caching, enabled parameter prevents errors)
  const { data: card } = useMyMembershipCard(isCustomer)
  const { data: tiers = [] } = useMembershipTiers()

  const maskPhone = (phone?: string) => {
    if (!phone) return '---'
    if (phone.length < 6) return phone
    return phone.replace(/(\d{3})\d+(\d{3})/, '$1****$2')
  }

  // Calculate tier details
  const currentTierName = 'Thường'
  const loyaltyPoints = profile?.customerInfo?.loyaltyPoint || 0

  // Mock total spending (using 10,000đ per loyalty point, or a baseline of 1,250,000đ)
  const calculatedSpending = loyaltyPoints * 10000 || 1250000

  // Find current tier index and next tier
  const sortedTiers = [...tiers].sort((a, b) => a.minSpending - b.minSpending)
  const currentTierIndex = sortedTiers.findIndex(
    t => t.name.toLowerCase() === currentTierName.toLowerCase()
  )
  
  const nextTier = currentTierIndex !== -1 && currentTierIndex < sortedTiers.length - 1
    ? sortedTiers[currentTierIndex + 1]
    : null

  // Calculate progress percent
  let progressPercent = 0
  let spendingNeeded = 0

  if (nextTier) {
    const minSpendingCurrent = currentTierIndex !== -1 ? sortedTiers[currentTierIndex].minSpending : 0
    const minSpendingNext = nextTier.minSpending
    const spendingInCurrentTierRange = calculatedSpending - minSpendingCurrent
    const totalRangeNeeded = minSpendingNext - minSpendingCurrent
    
    spendingNeeded = Math.max(0, minSpendingNext - calculatedSpending)
    progressPercent = totalRangeNeeded > 0 
      ? Math.min(100, Math.max(0, (spendingInCurrentTierRange / totalRangeNeeded) * 100))
      : 0
  } else if (currentTierIndex === sortedTiers.length - 1 && sortedTiers.length > 0) {
    progressPercent = 100
  }

  return (
    <div className="w-full bg-white rounded-t-2xl border-x border-t border-gray-100 shadow-sm relative overflow-hidden">
      {/* Background brand gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-lotus-rose/10 to-lotus-gold/10 rounded-full blur-[60px] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-lotus-cream to-lotus-rose-light/20 rounded-full blur-[60px] -ml-40 -mb-40 pointer-events-none" />
      
      {/* Top thin brand accent border */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-lotus-rose via-lotus-gold to-lotus-rose" />
      
      <div className="p-6 md:p-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Left: Avatar & User Basic Info */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-lotus-rose to-lotus-gold rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300" />
              {profile?.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.fullName || 'User avatar'} 
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-lotus-cream border-2 border-white shadow-md flex items-center justify-center text-lotus-rose">
                  <UserIcon className="w-10 h-10" />
                </div>
              )}
              {isCustomer && (
                <div className="absolute -bottom-1 -right-1 bg-lotus-gold text-white p-1.5 rounded-full shadow-md animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-lotus-deep font-display leading-tight">
                {profile?.fullName || profile?.username || 'Khách hàng'}
              </h2>
              <p className="text-sm text-lotus-stone font-medium">
                SĐT: {maskPhone(profile?.phone)}
              </p>
              
              {isCustomer ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lotus-rose-light text-lotus-rose text-xs font-semibold shadow-sm border border-lotus-rose/10">
                  <Award className="w-3.5 h-3.5" />
                  Hạng {currentTierName}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold shadow-sm border border-blue-100">
                  Nhân viên Spa
                </div>
              )}
            </div>
          </div>

          {/* Right Info panels (only for Customers) */}
          {isCustomer ? (
            <div className="flex-1 lg:max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-lotus-cream/40 backdrop-blur-sm rounded-xl p-4 border border-lotus-rose/5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 text-lotus-stone mb-1.5">
                    <Calendar className="w-4 h-4 text-lotus-rose" />
                    <span className="text-xs font-medium uppercase tracking-wider">Lịch hẹn</span>
                  </div>
                  {/* Mock total appointments */}
                  <p className="text-xl font-bold text-lotus-deep">12 <span className="text-xs text-lotus-stone font-normal">lượt</span></p>
                </div>

                <div className="bg-lotus-cream/40 backdrop-blur-sm rounded-xl p-4 border border-lotus-rose/5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 text-lotus-stone mb-1.5">
                    <Award className="w-4 h-4 text-lotus-gold" />
                    <span className="text-xs font-medium uppercase tracking-wider">Tích lũy</span>
                  </div>
                  <p className="text-xl font-bold text-lotus-gold">{loyaltyPoints} <span className="text-xs text-lotus-stone font-normal">điểm</span></p>
                </div>

                <div className="col-span-2 bg-lotus-cream/40 backdrop-blur-sm rounded-xl p-4 border border-lotus-rose/5 shadow-sm hover:shadow-md transition-all duration-200 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-lotus-gold/10 text-lotus-gold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-lotus-stone font-medium">Chi tiêu tích lũy</p>
                      <p className="text-lg font-bold text-lotus-deep">{formatCurrency(calculatedSpending)}</p>
                    </div>
                  </div>
                  {card?.cardCode && (
                    <div className="text-right">
                      <p className="text-[10px] text-lotus-stone font-semibold tracking-wider uppercase">Mã thẻ thành viên</p>
                      <p className="text-xs font-mono font-bold text-lotus-rose tracking-wider bg-lotus-rose-light px-2 py-0.5 rounded border border-lotus-rose/10 inline-block mt-0.5">
                        {card.cardCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress & Next Tier card */}
              <div className="bg-gradient-to-br from-lotus-deep to-lotus-deep/90 text-white rounded-xl p-5 shadow-lg border border-lotus-deep relative overflow-hidden flex flex-col justify-between">
                {/* Micro ornament */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-lotus-gold/20 rounded-full blur-xl" />
                
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-xs font-semibold text-lotus-gold uppercase tracking-wider">Tiến trình thăng hạng</h4>
                      <p className="text-sm font-bold mt-0.5">
                        {nextTier ? `Hạng tiếp theo: ${nextTier.name}` : 'Hạng tối đa'}
                      </p>
                    </div>
                    <Sparkles className="w-4 h-4 text-lotus-gold" />
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mb-3">
                    <div 
                      className="bg-gradient-to-r from-lotus-rose to-lotus-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-300">
                  {nextTier ? (
                    <p>
                      Cần chi tiêu thêm{' '}
                      <span className="font-bold text-lotus-gold">{formatCurrency(spendingNeeded)}</span>{' '}
                      để lên hạng thành viên <span className="font-bold text-lotus-gold">{nextTier.name}</span>.
                    </p>
                  ) : (
                    <p className="text-lotus-gold font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Chúc mừng! Bạn đã đạt hạng thành viên cao nhất.
                    </p>
                  )}
                  {card?.expiresAt && (
                    <p className="text-[10px] text-gray-400 mt-2">
                      Hạn dùng thẻ: {new Date(card.expiresAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            // Staff Placeholder Panel
            <div className="flex-1 lg:max-w-md bg-lotus-cream/40 rounded-xl p-5 border border-lotus-rose/5 shadow-sm text-lotus-deep flex flex-col justify-center">
              <h4 className="text-xs font-semibold text-lotus-rose uppercase tracking-wider mb-2">Thông tin làm việc</h4>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-lotus-stone font-medium">Mã nhân viên:</span> <span className="font-bold">{profile?.staffInfo?.code || '---'}</span></p>
                <p><span className="text-lotus-stone font-medium">Hợp đồng:</span> <span className="font-semibold">{profile?.staffInfo?.contractType || '---'}</span></p>
                {profile?.staffInfo?.hireDate && (
                  <p><span className="text-lotus-stone font-medium">Ngày vào làm:</span> <span className="font-semibold">{new Date(profile.staffInfo.hireDate).toLocaleDateString('vi-VN')}</span></p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
