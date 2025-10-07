import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const AnimatedStickers = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const stickers = gsap.utils.toArray('.sticker');

      // subtle float animation
      stickers.forEach((el: any, i: number) => {
        gsap.to(el, {
          y: '+=10',
          x: i % 2 === 0 ? '+=6' : '-=6',
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 1.5,
        });
      });

      // parallax on mouse move
      const handleMove = (e: MouseEvent) => {
        const rect = containerRef.current!.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        stickers.forEach((el: any, i: number) => {
          const depth = (i % 3) + 1; // 1..3
          gsap.to(el, {
            x: px * 12 * depth,
            y: py * 8 * depth,
            rotation: px * 6 * (i % 2 === 0 ? 1 : -1),
            duration: 0.6,
            ease: 'power3.out',
          });
        });
      };

      containerRef.current!.addEventListener('mousemove', handleMove);

      return () => {
        containerRef.current!.removeEventListener('mousemove', handleMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Law-themed SVG stickers positioned with absolute layout */}
      <svg className="sticker absolute top-8 left-6 w-20 h-20" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="#fff" opacity="0.06" />
        <path d="M16 44c6-8 16-12 24-12s18 4 24 12" stroke="#ffd166" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="22" y="18" width="20" height="6" rx="1" fill="#ffd166" />
      </svg>

      <svg className="sticker absolute top-4 right-12 w-24 h-24" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="#fff" opacity="0.05" />
        <path d="M40 18L28 26v12" stroke="#9ad3bc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 44h16" stroke="#9ad3bc" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <svg className="sticker absolute bottom-12 left-20 w-24 h-24" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="#fff" opacity="0.05" />
        <path d="M22 26h20v20H22z" stroke="#8ecae6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 30v12" stroke="#8ecae6" strokeWidth="2" strokeLinecap="round" />
        <path d="M34 30v12" stroke="#8ecae6" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <svg className="sticker absolute bottom-6 right-6 w-16 h-16" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="#fff" opacity="0.04" />
        <path d="M20 40c4-6 12-8 20-8s16 2 20 8" stroke="#f3b0c3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
