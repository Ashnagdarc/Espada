'use client'

interface SizeSelectorProps {
  sizes: string[]
  selectedSize: string
  onSizeSelect: (size: string) => void
  unavailableSizes?: string[]
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSizeSelect,
  unavailableSizes = []
}: SizeSelectorProps) {
  return (
    <div className="flex items-center justify-between max-w-[230px] h-9">
      {sizes.map((size) => {
        const isSelected = selectedSize === size
        const isUnavailable = unavailableSizes.includes(size)
        
        return (
          <button
            key={size}
            onClick={() => !isUnavailable && onSizeSelect(size)}
            disabled={isUnavailable}
            className={`flex items-center justify-center min-w-[35px] h-9 px-2 border transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-label-primary focus:ring-offset-2 focus:ring-offset-background ${
              isSelected
                ? 'border-label-primary bg-label-primary text-background'
                : isUnavailable
                ? 'border-separator bg-fill-secondary text-label-quaternary cursor-not-allowed opacity-50'
                : 'border-separator bg-background text-label-primary hover:border-label-secondary hover:bg-fill-secondary'
            }`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            aria-label={`Select size ${size}${isUnavailable ? ' (unavailable)' : ''}`}
            title={isUnavailable ? `Size ${size} is currently unavailable` : `Select size ${size}`}
          >
            {size}
            {isUnavailable && (
              <span className="sr-only"> (unavailable)</span>
            )}
          </button>
        )
      })}
    </div>
  )
}