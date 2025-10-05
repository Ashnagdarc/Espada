'use client'

interface Color {
  name: string
  value: string
}

interface ColorSelectorProps {
  colors: Color[]
  selectedColor: Color | null
  onColorSelect: (color: Color) => void
}

export default function ColorSelector({
  colors,
  selectedColor,
  onColorSelect
}: ColorSelectorProps) {
  return (
    <div className="flex items-center justify-between max-w-[230px] h-9">
      {colors.map((color, index) => (
        <button
          key={index}
          onClick={() => onColorSelect(color)}
          className={`relative w-[35px] h-9 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-label-primary focus:ring-offset-2 focus:ring-offset-background ${
            selectedColor?.value === color.value
              ? 'ring-2 ring-label-primary ring-offset-2 ring-offset-background scale-105'
              : 'hover:ring-1 hover:ring-label-secondary hover:ring-offset-1'
          }`}
          style={{ backgroundColor: color.value }}
          aria-label={`Select ${color.name} color`}
          title={color.name}
        >
          {/* White border for light colors */}
          {(color.value === '#FFFFFF' || color.value.toLowerCase() === '#ffffff') && (
            <div className="absolute inset-0 border border-separator" />
          )}
          
          {/* Selected indicator */}
          {selectedColor?.value === color.value && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${
                color.value === '#FFFFFF' || color.value === '#ffffff' || 
                color.value === '#D9D9D9' || color.value === '#d9d9d9'
                  ? 'bg-label-primary'
                  : 'bg-background'
              }`} />
            </div>
          )}
        </button>
      ))}
    </div>
  )
}