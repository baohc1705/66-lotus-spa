import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import { Section } from '@/shared/components/layout/Section';
import { Eyebrow, Heading, Body } from '@/shared/components/ui/Typography';

gsap.registerPlugin(ScrollTrigger);

const scenes = [
  {
    id: "HuongThom",
    label: "HƯƠNG",
    text: "Mùi cỏ dại và sương sớm đọng lại trên ngó sen, một cái hít thở sâu để ngực mở rộng.",
  },
  {
    id: "AmThanh",
    label: "ÂM",
    text: "Tiếng róc rách của nước và tiếng sải cánh vươn mình của loài sếu, đưa tâm trí trôi về miền ký ức.",
  },
  {
    id: "XucGiac",
    label: "XÚC",
    text: "Hơi ấm truyền qua từng ngón tay thô ráp, cái lướt nhẹ trên da như sự chở che từ tự nhiên.",
  }
];

export const AtmosphereSection = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className="relative overflow-hidden bg-white">
      <div ref={track} className="flex h-[100dvh] items-center px-12 md:px-24">
        
        {/* Intro Slide */}
        <div className="w-[85vw] md:w-[60vw] shrink-0 pr-12 md:pr-24">
          <Eyebrow className="mb-6 block">Giác Quan</Eyebrow>
          <Heading className="max-w-xl">Trở Về Trạng Thái Cân Bằng Tự Nhiên Nhất.</Heading>
        </div>

        {/* Sensory Slides */}
        {scenes.map((scene, idx) => (
          <div key={scene.id} className="w-[75vw] md:w-[40vw] shrink-0 pr-8 md:pr-16 flex flex-col justify-center h-full border-l border-lotus-muted/30 pl-8 md:pl-16">
            <span className="font-display text-8xl md:text-[12rem] text-lotus-muted/10 leading-none mb-8 font-medium">
              0{idx + 1}
            </span>
            <Heading as="h3" className="mb-6">{scene.label}</Heading>
            <Body className="max-w-sm">{scene.text}</Body>
          </div>
        ))}
        
        {/* Outro Spacer */}
        <div className="w-[20vw] shrink-0"></div>

      </div>
    </section>
  );
};
