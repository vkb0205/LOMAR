import { useEffect, useRef, useState } from 'react';
import heroWebM from '../../../assets/hero-bg-loop.webm';
import heroMp4 from '../../../assets/hero-bg-loop.mp4';
import heroPoster from '../../../assets/hero-bg-poster.jpg';

/**
 * Efficient animated hero background.
 *
 * Strategy for keeping a video background cheap on the web:
 * - Poster frame paints instantly (no layout shift / LCP hit); video fades in over it.
 * - WebM (VP9) preferred, MP4 (H.264) as universal fallback — both pre-compressed.
 * - `preload="metadata"` + `muted` + `playsInline` so autoplay is allowed and the
 *   browser doesn't buffer the whole clip ahead of time.
 * - Decoding pauses via IntersectionObserver when the hero scrolls out of view,
 *   saving CPU/battery (critical on mobile) — and resumes when back on screen.
 * - `prefers-reduced-motion` renders the static poster instead of an animated loop.
 */
export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  // Respect reduced-motion: skip animation entirely, keep the poster only.
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Fade the video in only once its first frame is decodable, so the poster
  // carries the initial paint and there is never an empty/flashing gap.
  const handleCanPlay = () => setReady(true);

  // Pause decoding when the hero scrolls off-screen to save CPU/battery.
  useEffect(() => {
    const node = videoRef.current;
    const video = node;
    if (!video || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {
            /* autoplay blocked — poster stays; user interaction re-enables it */
          });
        } else {
          video.pause();
        }
      },
      { rootMargin: '64px 0px' },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <img
        src={heroPoster}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
      autoPlay
      muted
      playsInline
      loop
      preload="metadata"
      poster={heroPoster}
      onCanPlay={handleCanPlay}
      tabIndex={-1}
      aria-hidden
    >
      <source src={heroWebM} type="video/webm" />
      <source src={heroMp4} type="video/mp4" />
    </video>
  );
}