import { useState, useCallback, useEffect, useRef } from 'react'
import { Award, Lock, Unlock, CheckCircle2, ShieldAlert, Sparkles, Gift, Zap, Coffee, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'
import { useMyMembershipCard, useMembershipTiers, useMembershipTierDetail } from '../hooks/useMembershipInfo'
import type { UserDto } from '@/features/users/types/user.types'
import type { MembershipCardDto } from '@/features/customers/types/membershipCard.types'
import type { MembershipTierDto } from '@/features/customers/types/membershipTier.types'

interface TierStyle {
  cardBg: string
  cardBgEnd: string
  cardBorder: string
  cardAccent: string
  cardText: string
  cardGlow: string
}

const getTierStyle = (tierName: string): TierStyle => {
  const name = tierName.toLowerCase()

  if (name.includes('đồng') || name.includes('bronze')) {
    return {
      cardBg: 'var(--membership-bronze-bg)',
      cardBgEnd: 'var(--membership-bronze-bg-end)',
      cardBorder: 'var(--membership-bronze-border)',
      cardAccent: 'var(--membership-bronze-accent)',
      cardText: 'var(--membership-bronze-text)',
      cardGlow: 'color-mix(in srgb, var(--membership-bronze-border) 15%, transparent)',
    }
  }
  if (name.includes('bạc') || name.includes('silver')) {
    return {
      cardBg: 'var(--membership-silver-bg)',
      cardBgEnd: 'var(--membership-silver-bg-end)',
      cardBorder: 'var(--membership-silver-border)',
      cardAccent: 'var(--membership-silver-accent)',
      cardText: 'var(--membership-silver-text)',
      cardGlow: 'color-mix(in srgb, var(--membership-silver-border) 15%, transparent)',
    }
  }
  if (name.includes('vàng') || name.includes('gold')) {
    return {
      cardBg: 'var(--membership-gold-bg)',
      cardBgEnd: 'var(--membership-gold-bg-end)',
      cardBorder: 'var(--membership-gold-border)',
      cardAccent: 'var(--membership-gold-accent)',
      cardText: 'var(--membership-gold-text)',
      cardGlow: 'color-mix(in srgb, var(--membership-gold-border) 20%, transparent)',
    }
  }
  if (name.includes('bạch kim') || name.includes('platinum')) {
    return {
      cardBg: 'var(--membership-platinum-bg)',
      cardBgEnd: 'var(--membership-platinum-bg-end)',
      cardBorder: 'var(--membership-platinum-border)',
      cardAccent: 'var(--membership-platinum-accent)',
      cardText: 'var(--membership-platinum-text)',
      cardGlow: 'color-mix(in srgb, var(--membership-platinum-border) 15%, transparent)',
    }
  }
  if (name.includes('kim cương') || name.includes('diamond')) {
    return {
      cardBg: 'var(--membership-diamond-bg)',
      cardBgEnd: 'var(--membership-diamond-bg-end)',
      cardBorder: 'var(--membership-diamond-border)',
      cardAccent: 'var(--membership-diamond-accent)',
      cardText: 'var(--membership-diamond-text)',
      cardGlow: 'color-mix(in srgb, var(--membership-diamond-border) 20%, transparent)',
    }
  }

  return {
    cardBg: 'var(--membership-default-bg)',
    cardBgEnd: 'var(--membership-default-bg-end)',
    cardBorder: 'var(--membership-default-border)',
    cardAccent: 'var(--membership-default-accent)',
    cardText: 'var(--membership-default-text)',
    cardGlow: 'color-mix(in srgb, var(--membership-default-border) 15%, transparent)',
  }
}

/* ==========================================
   TierCarousel Component
   ========================================== */

interface TierCarouselProps {
  sortedTiers: MembershipTierDto[]
  currentTierName: string
  currentTierIndex: number
  isLoadingTiers: boolean
  profile?: UserDto
  card?: MembershipCardDto | null
  activeIndex: number
  setActiveIndex: (idx: number) => void
}

function TierCarousel({ sortedTiers, currentTierName, currentTierIndex, isLoadingTiers, profile, card, activeIndex, setActiveIndex }: TierCarouselProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTransitionEnabled(true)
    setActiveIndex(index)
  }, [isTransitioning, setActiveIndex])

  const goLeft = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goRight = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  // Handle infinite loop snapping back
  useEffect(() => {
    if (!isTransitioning) return

    const timer = setTimeout(() => {
      setIsTransitioning(false)
      if (activeIndex === -1) {
        setTransitionEnabled(false)
        setActiveIndex(sortedTiers.length - 1)
      } else if (activeIndex === sortedTiers.length) {
        setTransitionEnabled(false)
        setActiveIndex(0)
      }
    }, 500) // matches transition duration (500ms)

    return () => clearTimeout(timer)
  }, [activeIndex, isTransitioning, sortedTiers.length, setActiveIndex])

  // Re-enable transition on the next tick
  useEffect(() => {
    if (!transitionEnabled) {
      const timer = setTimeout(() => {
        setTransitionEnabled(true)
      }, 20)
      return () => clearTimeout(timer)
    }
  }, [transitionEnabled])

  // Touch/drag support
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragStartX(e.clientX)
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStartX === null) return
    const diff = e.clientX - dragStartX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goLeft()
      else goRight()
    }
    setDragStartX(null)
  }, [dragStartX, goLeft, goRight])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goLeft()
      if (e.key === 'ArrowRight') goRight()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goLeft, goRight])

  if (isLoadingTiers) {
    return (
      <div>
        <h3 className="text-lg font-bold text-lotus-deep mb-5 font-sans flex items-center gap-2">
          <Gift className="w-5 h-5 text-lotus-rose" />
          Các hạng thẻ thành viên
        </h3>
        <div className="flex gap-6 justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 w-72 bg-warm-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (sortedTiers.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-bold text-lotus-deep mb-5 font-sans flex items-center gap-2">
          <Gift className="w-5 h-5 text-lotus-rose" />
          Các hạng thẻ thành viên
        </h3>
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-warm-100">
          <p className="text-lotus-stone">Không tìm thấy thông tin hạng thành viên nào.</p>
        </div>
      </div>
    )
  }

  const holderName = (profile?.fullName || profile?.username || 'Member').toUpperCase()

  // Clone 1 card on each side to enable loop
  const extendedTiers = [
    sortedTiers[sortedTiers.length - 1], // last card cloned on left
    ...sortedTiers,
    sortedTiers[0], // first card cloned on right
  ]

  const visibleCount = Math.min(sortedTiers.length, 3)
  const containerWidthPercent = extendedTiers.length * (100 / visibleCount)
  const translateX = -activeIndex * (100 / extendedTiers.length)

  return (
    <div>
      <h3 className="text-lg font-bold text-lotus-deep mb-5 font-sans flex items-center gap-2">
        <Gift className="w-5 h-5 text-lotus-rose" />
        Các hạng thẻ thành viên
      </h3>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={goLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-warm-100 shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl hover:scale-110 transition-all duration-200 -ml-3"
          aria-label="Thẻ trước"
        >
          <ChevronLeft className="w-5 h-5 text-lotus-deep" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={goRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-warm-100 shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl hover:scale-110 transition-all duration-200 -mr-3"
          aria-label="Thẻ sau"
        >
          <ChevronRight className="w-5 h-5 text-lotus-deep" />
        </button>

        {/* Cards Viewport */}
        <div
          ref={carouselRef}
          className="overflow-hidden py-8 px-8"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              transform: `translateX(${translateX}%)`,
              width: `${containerWidthPercent}%`,
              transition: transitionEnabled ? 'transform 500ms cubic-bezier(0.25,0.8,0.25,1)' : 'none',
            }}
          >
            {extendedTiers.map((tier, idx) => {
              const targetIdx = activeIndex + 1
              const distance = Math.abs(idx - targetIdx)
              const isActive = distance === 0

              const originalIdx = idx === 0 ? sortedTiers.length - 1 : idx === extendedTiers.length - 1 ? 0 : idx - 1
              const isCurrent = tier.name.toLowerCase() === currentTierName.toLowerCase()
              const isLocked = originalIdx > currentTierIndex
              const style = getTierStyle(tier.name)

              // Scale: active is larger (1.12), adjacent is smaller (0.88), further is 0.72
              const scale = isActive ? 1.12 : distance === 1 ? 0.88 : 0.72

              return (
                <div
                  key={`${tier.id}-${idx}`}
                  className="flex-shrink-0 px-3 cursor-pointer select-none"
                  style={{
                    width: `${100 / extendedTiers.length}%`,
                    transition: 'transform 500ms cubic-bezier(0.25, 0.8, 0.25, 1), opacity 500ms ease',
                    transform: `scale(${scale})`,
                    opacity: 1,
                    zIndex: isActive ? 20 : 10 - distance,
                  }}
                  onClick={() => goTo(idx - 1)}
                >
                  <div
                    className="relative w-full max-w-[400px] mx-auto rounded-2xl p-5 overflow-hidden group"
                    style={{
                      background: `linear-gradient(135deg, ${style.cardBg} 0%, ${style.cardBgEnd} 100%)`,
                      border: `1.5px solid ${style.cardBorder}30`,
                      boxShadow: isActive
                        ? `0 20px 45px -15px ${style.cardGlow}, 0 8px 25px -10px rgba(0,0,0,0.06)`
                        : `0 8px 25px -10px rgba(0,0,0,0.04)`,
                      color: style.cardText,
                      aspectRatio: '1.7 / 1',
                    }}
                  >
                    {/* Decorative glow */}
                    <div
                      className="absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl pointer-events-none"
                      style={{ background: style.cardAccent, opacity: 0.15 }}
                    />

                    {/* Corner Lock/Unlock Badge */}
                    <div
                      className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm z-[2] transition-all duration-300"
                      style={{
                        background: isLocked ? 'var(--error-bg)' : 'var(--success-bg)',
                        border: `1.5px solid ${isLocked ? 'var(--error-text)' : 'var(--success-text)'}`,
                      }}
                      title={isLocked ? 'Chưa mở khóa hạng' : 'Đã mở khóa hạng'}
                    >
                      {isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-error-text" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-success-text" />
                      )}
                    </div>

                    {/* Top: Brand + Tier Badge */}
                    <div className="flex justify-between items-start mb-3 relative z-[1] pr-8">
                      <p className="text-2xs font-extrabold tracking-widest uppercase" style={{ color: `${style.cardText}90` }}>
                        HOA SEN SPA
                      </p>
                      <span
                        className="text-2xs font-bold px-2.5 py-0.5 rounded-full shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${style.cardAccent}, ${style.cardBorder})`,
                          color: '#ffffff',
                        }}
                      >
                        {tier.name}
                      </span>
                    </div>

                    {/* Middle: Member Info */}
                    <div className="relative z-[1] mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: `${style.cardBorder}20` }}
                        >
                          <span className="text-2xs" style={{ color: style.cardBorder }}>👤</span>
                        </div>
                        <p className="text-xs font-bold truncate" style={{ color: style.cardText }}>
                          {holderName}
                        </p>
                      </div>
                      <p className="text-2xs font-medium" style={{ color: `${style.cardText}B0` }}>
                        Mã thẻ: <span className="font-bold" style={{ color: style.cardBorder }}>{card?.cardCode || 'HS-668899'}</span>
                      </p>
                    </div>

                    {/* Bottom: Status hint / Upgrade condition */}
                    <div className="mt-auto pt-3 relative z-[1]" style={{ borderTop: `1px solid ${style.cardBorder}20` }}>
                      <p className="text-2xs font-medium" style={{ color: `${style.cardText}90` }}>
                        {isCurrent ? (
                          <span className="flex items-center gap-1 text-success-text font-bold">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success-text animate-pulse" />
                            Hạng hiện tại của bạn
                          </span>
                        ) : isLocked ? (
                          <span>Yêu cầu tích lũy: <strong style={{ color: style.cardBorder }}>{formatCurrency(tier.minSpending)}</strong></span>
                        ) : (
                          <span className="text-success-text font-medium">Đặc quyền đã được kích hoạt</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-2">
          {sortedTiers.map((tier, idx) => {
            let displayActiveIdx = activeIndex
            if (activeIndex === -1) {
              displayActiveIdx = sortedTiers.length - 1
            } else if (activeIndex === sortedTiers.length) {
              displayActiveIdx = 0
            }
            const isActive = idx === displayActiveIdx
            const isCurrent = tier.name.toLowerCase() === currentTierName.toLowerCase()
            return (
              <button
                key={tier.id}
                onClick={() => goTo(idx)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: isActive ? '24px' : '8px',
                  height: '8px',
                  background: isActive
                    ? 'var(--rose-600)'
                    : isCurrent
                      ? 'var(--rose-600)'
                      : 'var(--warm-300)',
                  opacity: isActive ? 1 : isCurrent ? 0.6 : 0.4,
                }}
                aria-label={`Xem thẻ ${tier.name}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface MembershipPanelProps {
  profile?: UserDto
}

export function MembershipPanel({ profile }: MembershipPanelProps) {
  const isCustomer = profile?.profileType === 'Customer'
  const { data: card } = useMyMembershipCard(isCustomer)
  const { data: tiers = [], isLoading: isLoadingTiers } = useMembershipTiers()

  const currentTierName = card?.tierName || 'Thường'
  const sortedTiers = [...tiers].sort((a, b) => a.minSpending - b.minSpending)
  const currentTier = sortedTiers.find(
    t => t.name.toLowerCase() === currentTierName.toLowerCase()
  ) || (sortedTiers.length > 0 ? sortedTiers[0] : null)
  const currentTierIndex = currentTier ? sortedTiers.indexOf(currentTier) : -1

  const [activeIndex, setActiveIndex] = useState(0)
  const [prevTierIndex, setPrevTierIndex] = useState(currentTierIndex)

  if (currentTierIndex !== prevTierIndex) {
    setPrevTierIndex(currentTierIndex)
    if (currentTierIndex >= 0) {
      setActiveIndex(currentTierIndex)
    }
  }

  // Get selected tier details from API
  const selectedTier = sortedTiers[activeIndex] || (sortedTiers.length > 0 ? sortedTiers[0] : null)
  const { data: selectedTierDetail, isLoading: isLoadingDetail } = useMembershipTierDetail(selectedTier?.id)

  if (!isCustomer) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="w-12 h-12 text-lotus-stone mb-4" />
        <h3 className="text-lg font-bold text-lotus-deep font-sans">Dành riêng cho Khách hàng</h3>
        <p className="text-sm text-lotus-stone max-w-sm mt-2">
          Thông tin thẻ thành viên và các ưu đãi chỉ áp dụng cho tài khoản khách hàng.
        </p>
      </div>
    )
  }

  const getBenefitsList = (benefitsString: string | null) => {
    if (!benefitsString) return []
    return benefitsString
      .split(/[,\n;]/)
      .map(b => b.trim())
      .filter(b => b.length > 0)
  }

  const benefitIcons = [Gift, Zap, Coffee, Sparkles]

  return (
    <div className="space-y-10 animate-fade-in">

      {/* SECTION 1: Progress Tracker Timeline */}
      {sortedTiers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm relative overflow-hidden">
          <h3 className="text-lg font-bold text-lotus-deep mb-6 font-sans flex items-center gap-2">
            <Award className="w-5 h-5 text-lotus-rose" />
            Lộ trình thăng hạng
          </h3>

          <div className="relative pt-4 pb-8 px-4 md:px-8">
            {/* Horizontal Line background */}
            <div className="absolute top-[28px] left-[32px] right-[32px] h-[3px] bg-warm-100 -translate-y-1/2 z-0" />
            
            {/* Filled Progress Line */}
            {currentTierIndex !== -1 && sortedTiers.length > 1 && (
              <div 
                className="absolute top-[28px] left-[32px] h-[3px] bg-gradient-to-r from-lotus-rose to-lotus-gold -translate-y-1/2 z-0 transition-all duration-700"
                style={{ 
                  width: `${(currentTierIndex / (sortedTiers.length - 1)) * 100}%`,
                  maxWidth: 'calc(100% - 64px)'
                }}
              />
            )}

            {/* Timeline Nodes */}
            <div className="relative z-10 flex justify-between items-center">
              {sortedTiers.map((tier, idx) => {
                const isCurrent = tier.name.toLowerCase() === currentTierName.toLowerCase()
                const isPassed = idx < currentTierIndex

                return (
                  <div key={tier.id} className="flex flex-col items-center text-center group">
                    {/* Node Dot */}
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-lotus-gold text-white ring-4 ring-lotus-gold/20 scale-110 shadow-md shadow-lotus-gold/25'
                          : isPassed
                            ? 'bg-lotus-rose text-white'
                            : 'bg-white border-2 border-warm-100 text-warm-400 group-hover:border-lotus-rose group-hover:text-lotus-rose'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                    </div>

                    {/* Node Labels */}
                    <div className="mt-3">
                      <p className={`text-xs font-bold ${isCurrent ? 'text-lotus-gold' : 'text-lotus-deep'}`}>
                        {tier.name}
                      </p>
                      <p className="text-2xs text-lotus-stone font-medium mt-0.5">
                        {tier.minSpending === 0 ? 'Mở đầu' : `${formatCurrency(tier.minSpending)}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Tiers Cards Carousel */}
      <TierCarousel
        sortedTiers={sortedTiers}
        currentTierName={currentTierName}
        currentTierIndex={currentTierIndex}
        isLoadingTiers={isLoadingTiers}
        profile={profile}
        card={card}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />

      {/* SECTION 3: Selected Tier Details */}
      <div className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-lotus-rose-light/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-warm-100">
          <div>
            <span className="text-xs font-bold text-lotus-rose uppercase tracking-widest">Chi tiết hạng thẻ</span>
            <h3 className="text-2xl font-bold text-lotus-deep font-sans mt-1 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-lotus-gold" />
              Hạng {selectedTier?.name}
            </h3>
          </div>
          
          {selectedTier && (
            <div className="flex flex-wrap gap-3">
              {/* Spending Condition */}
              <div className="px-4 py-2 rounded-xl bg-warm-50 border border-warm-100">
                <p className="text-2xs text-lotus-stone uppercase font-bold tracking-wider">Chi tiêu tối thiểu</p>
                <p className="text-sm font-extrabold text-lotus-deep mt-0.5">
                  {selectedTier.minSpending === 0 ? 'Mở đầu (Miễn phí)' : formatCurrency(selectedTier.minSpending)}
                </p>
              </div>
              {/* Discount */}
              <div className="px-4 py-2 rounded-xl bg-lotus-rose/5 border border-lotus-rose/10">
                <p className="text-2xs text-lotus-rose uppercase font-bold tracking-wider">Ưu đãi giảm giá</p>
                <p className="text-sm font-extrabold text-lotus-rose mt-0.5">
                  {selectedTier.discountPercent}% hóa đơn
                </p>
              </div>
              {/* Point multiplier */}
              <div className="px-4 py-2 rounded-xl bg-lotus-gold/5 border border-lotus-gold/10">
                <p className="text-2xs text-lotus-gold uppercase font-bold tracking-wider">Tích điểm</p>
                <p className="text-sm font-extrabold text-lotus-gold mt-0.5">
                  Nhân hệ số x{selectedTier.pointMultiplier}
                </p>
              </div>
            </div>
          )}
        </div>

        {isLoadingDetail ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-lotus-rose border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-lotus-stone">Đang tải thông tin chi tiết...</p>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-bold text-lotus-deep mb-4">Các đặc quyền của hạng {selectedTier?.name}:</h4>
            {selectedTierDetail && getBenefitsList(selectedTierDetail.benefits).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getBenefitsList(selectedTierDetail.benefits).map((benefit, idx) => {
                  const Icon = benefitIcons[idx % benefitIcons.length]
                  
                  return (
                    <div 
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-lotus-cream/20 border border-lotus-rose/5 hover:border-lotus-rose/10 transition-all duration-200"
                    >
                      <div className="p-2.5 rounded-lg bg-lotus-rose/10 text-lotus-rose flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-lotus-deep">{benefit}</h4>
                        <p className="text-xs text-lotus-stone mt-1">Áp dụng trực tiếp tại quầy hoặc khi thanh toán online trên hệ thống.</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-lotus-cream/20 border border-lotus-rose/5">
                  <div className="p-2.5 rounded-lg bg-lotus-rose/10 text-lotus-rose flex-shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-lotus-deep">Chiết khấu dịch vụ trị liệu</h4>
                    <p className="text-xs text-lotus-stone mt-1">
                      Giảm giá trực tiếp {selectedTierDetail?.discountPercent || selectedTier?.discountPercent || 0}% trên hóa đơn dịch vụ chăm sóc da và cơ thể.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-lotus-cream/20 border border-lotus-rose/5">
                  <div className="p-2.5 rounded-lg bg-lotus-rose/10 text-lotus-rose flex-shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-lotus-deep">Nhân hệ số tích điểm</h4>
                    <p className="text-xs text-lotus-stone mt-1">
                      Hệ số tích lũy hoa sen x{selectedTierDetail?.pointMultiplier || selectedTier?.pointMultiplier || 1.0} giúp nhanh chóng thăng hạng và quy đổi quà tặng.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-lotus-cream/20 border border-lotus-rose/5">
                  <div className="p-2.5 rounded-lg bg-lotus-rose/10 text-lotus-rose flex-shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-lotus-deep">Thưởng thức trà thảo mộc</h4>
                    <p className="text-xs text-lotus-stone mt-1">
                      Phục vụ trà hoa cúc, sâm dứa đặc biệt và đồ ăn nhẹ dưỡng nhan miễn phí trong phòng chờ.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-lotus-cream/20 border border-lotus-rose/5">
                  <div className="p-2.5 rounded-lg bg-lotus-rose/10 text-lotus-rose flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-lotus-deep">Ưu tiên đặt giờ dịch vụ</h4>
                    <p className="text-xs text-lotus-stone mt-1">
                      Được ưu tiên xếp lịch hẹn trước với Kỹ thuật viên yêu thích trong các khung giờ cao điểm.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: Ưu đãi của bạn */}
      <div className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm relative overflow-hidden">
        <h3 className="text-lg font-bold text-lotus-deep mb-4 font-sans flex items-center gap-2">
          <Gift className="w-5 h-5 text-lotus-gold" />
          Mã giảm giá & Quà tặng của bạn
        </h3>
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-warm-100 rounded-xl bg-warm-50/50">
          <Gift className="w-10 h-10 text-lotus-stone/60 mb-3" />
          <p className="text-sm font-bold text-lotus-deep">Chưa có ưu đãi nào</p>
          <p className="text-xs text-lotus-stone max-w-xs mt-1">
            Theo dõi fanpage Hoa Sen Spa hoặc đặt lịch thường xuyên để nhận được các mã ưu đãi độc quyền.
          </p>
        </div>
      </div>

    </div>
  )
}
