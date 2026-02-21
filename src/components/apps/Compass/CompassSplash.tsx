import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Compass as CompassIcon } from "lucide-react";

interface CompassSplashProps {
  onComplete: () => void;
}

export function CompassSplash({ onComplete }: CompassSplashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Fade out the whole container before calling onComplete
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: onComplete
          });
        }
      });

      // Initial state
      gsap.set(compassRef.current, { scale: 0, rotation: -180, opacity: 0 });
      gsap.set(textRef.current, { y: 20, opacity: 0 });

      // Animate Compass In
      tl.to(compassRef.current, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)"
      })
      // Spin the needle (simulate calibration)
      .to(compassRef.current, {
        rotation: 360 * 2, // Spin twice
        duration: 1.5,
        ease: "back.inOut(1.7)"
      }, "-=0.5")
      // Settle nicely
      .to(compassRef.current, {
        rotation: 0,
        duration: 0.5,
        ease: "power2.out"
      })
      // Text Fade In
      .to(textRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.5")
      // Hold for a moment
      .to({}, { duration: 0.5 });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white"
    >
      <div className="relative">
        <CompassIcon 
          ref={compassRef}
          size={120} 
          strokeWidth={1}
          className="text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]"
        />
        {/* Decorative ring around compass */}
        <div className="absolute inset-0 rounded-full border border-rose-500/20 scale-150 animate-pulse" />
      </div>
      
      <div ref={textRef} className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-2xl font-display tracking-widest uppercase text-white/90">
          The Compass
        </h2>
        <p className="text-sm text-rose-300/70 font-mono tracking-widest">
          CALIBRATING...
        </p>
      </div>
    </div>
  );
}
