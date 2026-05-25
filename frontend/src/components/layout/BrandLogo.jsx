const LOGO_URL = '/logo.png'

export default function BrandLogo({ logoClassName = 'h-20 w-auto', align = 'left' }) {
  const justifyClass = align === 'center' ? 'justify-center' : 'justify-start'

  return (
    <div className={`flex ${justifyClass}`}>
      <div className="relative inline-block">
        <img src={LOGO_URL} alt="Vantage" className={logoClassName} />
        <span
          className="pointer-events-none absolute left-[28%] bottom-[23%] whitespace-nowrap text-[5px] font-semibold uppercase tracking-[0.34em] text-white/90 sm:text-[6px] md:text-[7px]"
          style={{ textShadow: '0 0 6px rgba(255,255,255,0.18)' }}
        >
          Decisions, Upgraded!
        </span>
      </div>
    </div>
  )
}
