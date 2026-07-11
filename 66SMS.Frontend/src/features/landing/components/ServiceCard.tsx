
interface ServiceCardProps {
  title: string
  description: string
  price: string
  imageSrc: string
  imageAlt: string
}

export const ServiceCard = ({
  title,
  description,
  price,
  imageSrc,
  imageAlt,
}: ServiceCardProps) => {
  return (
    <div className="service-panel" tabIndex={0}>
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover`}
      />
      <div className="service-panel__content">
        <h3 className={`font-display text-xl font-semibold text-white mb-1`}>
          {title}
        </h3>
        <div className="service-panel__detail">
          <p className={`font-sans text-sm text-white/80 leading-relaxed mb-3`}>
            {description}
          </p>
          <span className={`block font-sans text-sm font-medium text-gold-600 mb-3`}>
            Từ {price}
          </span>
          <a
            href="#booking"
            className={`inline-flex items-center gap-1 font-sans text-sm font-medium text-white border-b border-white/40 hover:border-white pb-0.5 transition-colors duration-300`}
          >
            Đặt lịch
          </a>
        </div>
      </div>
    </div>
  )
}
