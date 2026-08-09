import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, User, X } from "lucide-react";

type ImageUploadSize = "sm" | "md" | "lg";

type ImageUploadProps = {
  value?: string | null;
  onFileChange: (file: File | null) => void;
  shape?: "circle" | "square";
  size?: ImageUploadSize;
  label?: string;
  accept?: string;
  className?: string;
};

const sizeClass: Record<ImageUploadSize, string> = {
  sm: "h-20 w-20",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const iconSizeClass: Record<ImageUploadSize, string> = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-8 w-8",
};

export function ImageUpload({
  value,
  onFileChange,
  shape = "square",
  size = "md",
  label = "Chọn ảnh",
  accept = "image/jpeg,image/png,image/webp",
  className = "",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  const displaySrc = cleared ? null : (localPreview ?? value ?? null);
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-lg";

  function openPicker() {
    inputRef.current?.click();
  }

  function handleChange(e: { target: { files: FileList | null } }) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCleared(false);
    setLocalPreview(URL.createObjectURL(file));
    onFileChange(file);
  }

  function handleClear(e: { stopPropagation(): void }) {
    e.stopPropagation();
    setLocalPreview(null);
    setCleared(true);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={"inline-flex font-sans " + className}>
      <button
        type="button"
        onClick={openPicker}
        aria-label={label}
        className={
          "group relative flex shrink-0 flex-col items-center justify-center overflow-hidden " +
          "transition-colors focus-visible:outline-hidden focus-visible:ring-2 " +
          "focus-visible:ring-blue-600/25 " +
          sizeClass[size] +
          " " +
          radiusClass +
          " " +
          (displaySrc
            ? "border border-kit bg-kit-white hover:border-kit-primary"
            : "border-2 border-dashed soft-kit-primary hover:border-kit-primary")
        }
      >
        {displaySrc ? (
          <>
            <img
              src={displaySrc}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-kit-white" />
              <span className="text-xs font-semibold text-kit-white">
                Thay ảnh
              </span>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClear(e);
              }}
              className={
                "absolute top-1 right-1 z-10 hidden h-6 w-6 items-center justify-center " +
                "rounded-full bg-black/60 text-kit-white group-hover:inline-flex " +
                "hover:bg-kit-danger"
              }
              aria-label="Xóa ảnh"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 px-2 text-kit-primary">
            {shape === "circle" ? (
              <User className={iconSizeClass[size]} />
            ) : (
              <ImageIcon className={iconSizeClass[size]} strokeWidth={1.75} />
            )}
            <span className="text-center text-xs font-medium leading-tight">
              {label}
            </span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
