import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselSlide = {
  image: string;
  captionTitle?: string;
  captionText?: string;
  alt?: string;
};

type CarouselProps = {
  slides?: CarouselSlide[];
  images?: string[];
  items?: ReactNode[];
  fade?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
};

export function Carousel({
  slides,
  images,
  items,
  fade = false,
  autoPlay = true,
  interval = 5000,
  className = "",
}: CarouselProps) {
  const normalized: CarouselSlide[] =
    slides ?? (images ?? []).map((src: string) => ({ image: src }));

  const [index, setIndex] = useState(0);
  const count = items ? items.length : normalized.length;

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i: number) => (i === count - 1 ? 0 : i + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, count, interval]);

  if (count === 0) return null;

  function prev() {
    setIndex((i: number) => (i === 0 ? count - 1 : i - 1));
  }

  function next() {
    setIndex((i: number) => (i === count - 1 ? 0 : i + 1));
  }

  return (
    <div
      className={
        "carousel slide relative overflow-hidden " +
        (fade ? "carousel-fade " : "") +
        className
      }
    >
      <div className="carousel-inner relative w-full">
        {items ? (
          <div className="carousel-item active aspect-2/1 w-full">{items[index]}</div>
        ) : (
          normalized.map((slide: CarouselSlide, i: number) => {
            const active = i === index;
            return (
              <div
                key={slide.image + "-" + i}
                className={
                  "carousel-item relative aspect-2/1 w-full " +
                  (fade
                    ? "absolute inset-0 transition-opacity duration-700 " +
                      (active ? "z-1 opacity-100" : "z-0 opacity-0")
                    : active
                      ? "relative block"
                      : "hidden")
                }
              >
                <img
                  className="block h-full w-full object-cover"
                  src={slide.image}
                  alt={slide.alt ?? "Slide " + (i + 1)}
                />
                {slide.captionTitle || slide.captionText ? (
                  <div className="carousel-caption absolute bottom-5 left-0 right-0 hidden px-4 text-center text-white md:block">
                    {slide.captionTitle ? (
                      <h5 className="m-0 text-lg font-normal drop-shadow">
                        {slide.captionTitle}
                      </h5>
                    ) : null}
                    {slide.captionText ? (
                      <p className="mb-0 mt-1 text-sm drop-shadow">{slide.captionText}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
        {fade && !items ? <div className="aspect-2/1 w-full" aria-hidden /> : null}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute top-0 left-0 z-2 flex h-full w-1/6 items-center justify-center border-0 bg-transparent text-white opacity-50 hover:opacity-90"
            aria-label="Previous"
          >
            <ChevronLeft className="size-8" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute top-0 right-0 z-2 flex h-full w-1/6 items-center justify-center border-0 bg-transparent text-white opacity-50 hover:opacity-90"
            aria-label="Next"
          >
            <ChevronRight className="size-8" />
          </button>
        </>
      ) : null}
    </div>
  );
}
