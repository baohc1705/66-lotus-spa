import { useState, type ImgHTMLAttributes, type SyntheticEvent } from "react";
import serviceNull from "@/assets/nulls/service-null.webp";
import productNull from "@/assets/nulls/pro-null.webp";
import ktvNull from "@/assets/nulls/ktv-null.webp";
import salonNull from "@/assets/nulls/salon-null.webp";
import customerNull from "@/assets/nulls/customer-null.webp";
import positionNull from "@/assets/nulls/position-null.webp";

export type FallbackImageKind =
  | "service"
  | "product"
  | "ktv"
  | "salon"
  | "customer"
  | "position";

const FALLBACK_SRC: Record<FallbackImageKind, string> = {
  service: serviceNull,
  product: productNull,
  ktv: ktvNull,
  salon: salonNull,
  customer: customerNull,
  position: positionNull,
};

export function getFallbackImageSrc(kind: FallbackImageKind): string {
  return FALLBACK_SRC[kind];
}

/** Trả về src hợp lệ; null/rỗng → ảnh static theo loại */
export function resolveImageSrc(
  src: string | null | undefined,
  kind: FallbackImageKind,
): string {
  const trimmed = src?.trim();
  return trimmed ? trimmed : FALLBACK_SRC[kind];
}

type FallbackImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  kind: FallbackImageKind;
};

/**
 * Ảnh có fallback: null / lỗi đường dẫn / load fail → dùng ảnh static trong assets/nulls.
 */
export function FallbackImage({
  src,
  kind,
  alt = "",
  onError,
  ...rest
}: FallbackImageProps) {
  const fallback = FALLBACK_SRC[kind];
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setFailed(false);
  }

  const resolved = failed ? fallback : resolveImageSrc(src, kind);

  return (
    <img
      src={resolved}
      alt={alt}
      onError={(e: SyntheticEvent<HTMLImageElement>) => {
        if (!failed) setFailed(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
}
