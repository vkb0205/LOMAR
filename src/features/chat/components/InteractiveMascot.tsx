import React, { useEffect, useRef } from 'react';
import mascotBody from '../../../assets/images/Mascot_new.png';

interface InteractiveMascotProps {
  className?: string;
  isHovered?: boolean;
  isOpen?: boolean;
}

/**
 * Bé Song Hỷ mascot.
 *
 * The current `Mascot_new.png` asset has the eyes baked into the illustration,
 * so there is no separate eye sprite to track the cursor with (the old
 * `mascot_eye.png` overlay was calibrated for the previous 1920x1080 mascot and
 * no longer aligns). Instead the mascot is kept "alive" by animating the whole
 * image:
 *
 *  - a slow idle breathing bob so it never looks frozen,
 *  - a periodic blink (quick vertical squash),
 *  - a friendly bounce when hovered,
 *  - a subtle whole-body tilt that follows the cursor.
 */
export default function InteractiveMascot({ className = '', isHovered, isOpen }: InteractiveMascotProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Whole-body cursor-follow tilt. Applied directly to the DOM node to avoid
  // React re-renders on every mousemove. Works regardless of where the eyes
  // are baked into the artwork.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized offset from the mascot's center, clamped to a subtle range.
      const dx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

      // Gentle 3D-ish tilt: rotateY follows horizontal, rotateX follows vertical.
      const rotateY = dx * 10;
      const rotateX = -dy * 8;

      el.style.transform = `perspective(400px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Reset the tilt when the mascot is no longer on screen (panel closed).
  useEffect(() => {
    if (!isOpen && rootRef.current) {
      rootRef.current.style.transform = '';
    }
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className={`relative select-none will-change-transform ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Idle breathing bob + hover bounce + periodic blink, layered on the image. */}
      <div
        className="h-full w-full"
        style={{
          animation: [
            'mascot-idle-bob 3.2s ease-in-out infinite',
            isHovered ? 'mascot-hover-bounce 0.7s ease-fluid' : '',
            'mascot-blink 4.5s ease-in-out infinite',
          ]
            .filter(Boolean)
            .join(', '),
        }}
      >
        <img
          src={mascotBody}
          alt="Bé Song Hỷ"
          className="h-full w-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
