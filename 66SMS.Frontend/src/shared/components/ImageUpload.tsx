import { useRef, useState } from 'react'
import { Camera, User, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string | null
  onFileChange: (file: File | null) => void
  shape?: 'circle' | 'square'
  label?: string
}

export function ImageUpload({ value, onFileChange, shape = 'circle', label = 'Chọn ảnh' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const handleChange = (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLocalPreview(URL.createObjectURL(file))
    onFileChange(file)
  }

  const displaySrc = localPreview ?? value
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={[
          'group relative h-24 w-24 shrink-0 overflow-hidden transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lotus-leaf focus-visible:ring-offset-2',
          shapeClass,
          displaySrc
            ? 'border border-stone-200 hover:border-lotus-leaf/60'
            : 'border-2 border-dashed border-stone-300 bg-stone-50 hover:border-lotus-leaf hover:bg-lotus-leaf/5',
        ].join(' ')}
      >
        {displaySrc ? (
          <>
            <img src={displaySrc} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
              <span className="text-[11px] font-semibold text-white">Thay ảnh</span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400 transition-colors group-hover:text-lotus-leaf">
            {shape === 'circle' ? <User className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
            <span className="px-2 text-center text-[10px] font-medium leading-tight">{label}</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      <div className="space-y-1">
        {displaySrc ? (
          <p className="text-[12px] font-medium text-emerald-600">✓ Đã chọn ảnh</p>
        ) : (
          <p className="text-[12px] text-stone-500">Nhấp vào ô ảnh để tải lên</p>
        )}
        <p className="text-[11px] text-stone-400">JPG, PNG, WEBP · Tối đa 5MB</p>
      </div>
    </div>
  )
}
