'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { config } from '@/lib/config';

// Az F8 utáni rövid overlap-intró: a config.sections.Sn.bevezeto fullscreen képei
// egymásra csúsznak (auto-play GSAP timeline). A végén onIntroComplete() → tovább az újságra.
// A returnNonce NÖVELÉSÉRE (vissza-gomb) a timeline visszafelé pereg (reverse).
export function OverlapSections({
  sectionId,
  returnNonce = 0,
  onIntroComplete
}: {
  sectionId: number;
  returnNonce?: number;
  onIntroComplete?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLImageElement | null>>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const holdCallRef = useRef<gsap.core.Tween | null>(null);

  // Stabil callback-mirror, hogy a fő timeline-effect ne ragadjon stale closure-be,
  // és ne fusson újra a callback-identitás változására.
  const onIntroCompleteRef = useRef(onIntroComplete);
  useEffect(() => {
    onIntroCompleteRef.current = onIntroComplete;
  }, [onIntroComplete]);

  const sectionKey = `S${sectionId}` as keyof typeof config.sections;
  const bevezeto = config.sections[sectionKey].bevezeto;

  useEffect(() => {
    // Üres bevezeto → nincs intró, rögtön tovább az újságra.
    if (bevezeto.length === 0) {
      onIntroCompleteRef.current?.();
      return;
    }

    const ctx = gsap.context(() => {
      const panels = panelRefs.current.filter((p): p is HTMLImageElement => p !== null);
      if (panels.length === 0) return;

      // Kiindulás: az első panel látszik, a többi a képernyő alján vár.
      panels.forEach((panel, i) => {
        gsap.set(panel, { yPercent: i === 0 ? 0 : 100 });
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          // Az utolsó overlap-kép után overlapHoldSeconds várakozás, majd tovább az újságra.
          holdCallRef.current = gsap.delayedCall(config.f8Transition.overlapHoldSeconds, () => {
            onIntroCompleteRef.current?.();
          });
        }
      });

      // Minden további panel felcsúszik az előző fölé.
      panels.slice(1).forEach((panel) => {
        tl.to(panel, { yPercent: 0, duration: 0.6 });
      });

      tlRef.current = tl;
    }, containerRef);

    return () => {
      holdCallRef.current?.kill();
      holdCallRef.current = null;
      tlRef.current = null;
      ctx.revert();
    };
  }, [sectionId, bevezeto]);

  // A "Vissza a rádióhoz" gomb növeli a returnNonce-t → a timeline visszafelé pereg.
  // prev-ref guard: mountkor NEM szabad reverse-elni (akkor is, ha returnNonce már > 0).
  const prevReturnNonce = useRef(returnNonce);
  useEffect(() => {
    if (returnNonce > prevReturnNonce.current) {
      tlRef.current?.reverse();
    }
    prevReturnNonce.current = returnNonce;
  }, [returnNonce]);

  if (bevezeto.length === 0) {
    return <div className='relative h-screen w-full bg-black' />;
  }

  return (
    <div ref={containerRef} className='relative h-screen w-full overflow-hidden bg-black'>
      {bevezeto.map((src, i) => (
        <img
          key={src}
          ref={(el) => {
            panelRefs.current[i] = el;
          }}
          src={src}
          alt={`section${sectionId} overlap ${i + 1}`}
          className='absolute inset-0 h-full w-full object-cover'
          style={{ zIndex: i + 1, willChange: 'transform' }}
        />
      ))}
    </div>
  );
}
