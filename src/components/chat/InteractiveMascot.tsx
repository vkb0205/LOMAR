import React, { useEffect, useRef } from 'react';
import mascotBody from '../../img/Mascot.png';
// import mascotEye from '../../img/mascot_eye.png';

interface InteractiveMascotProps {
  className?: string;
  isHovered?: boolean;
  isOpen?: boolean;
}

export default function InteractiveMascot({ className = '', isHovered, isOpen }: InteractiveMascotProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLImageElement>(null);

  /*
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current || !pupilRef.current) return;

      // Get exact center of the eye container
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      // Calculate distance between mouse cursor and eye center
      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;

      // Calculate angle and distance
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.hypot(deltaX, deltaY);

      // Limit pupil displacement to keep the eye movement subtle and within bounds
      const maxDistance = 3; // Maximum offset in pixels
      // As distance increases, the pupil approaches maxDistance asymptotically and stays there
      const limitedDistance = maxDistance * (1 - Math.exp(-distance / 80));

      // Compute X and Y offsets
      const pupilX = Math.cos(angle) * limitedDistance;
      const pupilY = Math.sin(angle) * limitedDistance;

      // Apply transform directly to avoid React re-renders for high performance
      pupilRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  */

  return (
    <div className={`relative select-none ${className}`}>
      {/* Mascot Body */}
      <img
        src={mascotBody}
        alt="Mascot Body"
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Eye Socket Container (Calibrated center of the mascot's eye socket) */}
      {/*
      <div
        ref={eyeRef}
        className="absolute left-[33.125%] top-[37.09%] w-[12%] h-[10.84%] overflow-hidden rounded-full pointer-events-none"
      >
        <img
          ref={pupilRef}
          src={mascotEye}
          alt="Mascot Eye"
          className="absolute transition-transform duration-75 ease-out max-w-none pointer-events-none"
          style={{
            width: '1034.34%',
            height: '922.52%',
            left: '-350.42%',
            top: '-341.35%',
          }}
        />
      </div>
      */}
    </div>
  );
}
