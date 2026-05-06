'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function ParallaxExperience() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  
  const bgImgRef = useRef<HTMLImageElement>(null);
  const snoopRef = useRef<HTMLImageElement>(null);
  const repRef = useRef<HTMLImageElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const sinBalRef = useRef<HTMLImageElement>(null);
  const sinJobbRef = useRef<HTMLImageElement>(null);
  const vonatRef = useRef<HTMLImageElement>(null);
  const dikRef = useRef<HTMLImageElement>(null);
  const lampRef = useRef<HTMLDivElement>(null);

  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Setup alaphelyzetek
      gsap.set(repRef.current, { xPercent: -50, left: "50%", zIndex: 100 });
      gsap.set(vonatRef.current, { xPercent: -50, left: "50%", yPercent: 150, scale: 0.4, opacity: 0, zIndex: 150 });
      gsap.set(sinBalRef.current, { xPercent: -120, opacity: 0 });
      gsap.set(sinJobbRef.current, { xPercent: 120, opacity: 0 });
      
      gsap.set(dikRef.current, { 
        opacity: 0, 
        scale: 1.2, 
        left: "50%", 
        top: "50%", 
        xPercent: -50, 
        yPercent: -50 
      });

      // Lámpa pislákolás
      gsap.to(lampRef.current, {
        opacity: 0.1, duration: 0.05, repeat: -1, yoyo: true, repeatDelay: 0.1,
        ease: "rough({ strength: 2, points: 20, randomize: true })"
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=800%", 
          pin: pinRef.current,
          scrub: 0.3,
          onUpdate: (self) => {
            // Csak a legvégén kapcsoljuk be az egérmozgást (95% felett)
            setIsInteractive(self.progress > 0.95);
          }
        }
      });

      // Az animációs lánc, ami "jó volt"
      tl.fromTo(snoopRef.current, { y: 400, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .to(snoopRef.current, { opacity: 0, scale: 1.1, duration: 0.3 }, "-=0.2")
        .fromTo(repRef.current, { yPercent: -150 }, { yPercent: 450, scale: 8, duration: 1, ease: "power2.in" }, "<")
        .fromTo(cityRef.current, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, "<")
        .to([sinBalRef.current, sinJobbRef.current], { xPercent: 0, opacity: 1, duration: 0.4 }, "-=0.3")
        .to(vonatRef.current, { yPercent: -20, scale: 1.3, opacity: 1, duration: 0.8 }, "-=0.1")
        .to(vonatRef.current, { yPercent: -500, scale: 100, duration: 1.2, ease: "power4.in" }, "+=0.1")
        .to(dikRef.current, { opacity: 1, scale: 1.1, duration: 1 }, "-=0.8")
        .to([cityRef.current, repRef.current, sinBalRef.current, sinJobbRef.current, bgImgRef.current], { opacity: 0, duration: 0.1 }, "-=0.5")
        // Egy kis üres extra idő a végére, hogy lehessen mozgatni az egeret lefelé görgetve is
        .to({}, { duration: 2 });

    }, triggerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!isInteractive) return;
    const moveHandler = (e: MouseEvent) => {
      if (!dikRef.current) return;
      const xMove = (e.clientX / window.innerWidth - 0.5) * 100;
      const yMove = (e.clientY / window.innerHeight - 0.5) * 100;
      
      gsap.to(dikRef.current, {
        xPercent: -50 + (xMove / 10),
        yPercent: -50 + (yMove / 10),
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto"
      });
    };
    window.addEventListener('mousemove', moveHandler);
    return () => window.removeEventListener('mousemove', moveHandler);
  }, [isInteractive]);

  return (
    <div ref={triggerRef} className="bg-black w-full">
      <section ref={pinRef} className="relative h-screen w-full overflow-hidden">
        
        {/* INTERAKTÍV FAL */}
        <img 
          ref={dikRef} 
          src="/img/dik.jpg" 
          className="absolute w-[120%] h-[120%] object-cover z-0" 
          alt="dik"
        />

        {/* LÁMPA */}
        <div 
          ref={lampRef}
          className="absolute right-[5%] top-[40%] w-[500px] h-[600px] bg-yellow-600/20 rounded-full blur-[130px] z-10 pointer-events-none"
          style={{ mixBlendMode: 'plus-lighter' }} 
        />

        {/* ELŐZŐ JELENET RÉTEGEI */}
        <img id="parallax-bg" ref={bgImgRef} src="/img/bg.jpg" className="absolute inset-0 w-full h-full object-cover z-10" />

        <div className="absolute inset-0 z-20 flex items-end justify-center pointer-events-none">
          <img ref={snoopRef} src="/img/snoop.png" className="w-auto h-[80vh] object-contain" />
        </div>

        <div ref={cityRef} className="absolute inset-0 z-30 w-full h-full">
          <img src="/img/city.jpg" className="w-full h-full object-cover" />
          <img ref={sinBalRef} src="/img/sin.png" className="absolute left-0 top-0 h-full w-1/3 object-cover z-40 rotate-90" />
          <img ref={sinJobbRef} src="/img/sin.png" className="absolute right-0 top-25 h-full w-1/3 object-cover z-40 -rotate-90" />
          <img ref={vonatRef} src="/img/vonat.png" className="absolute bottom-0 w-full max-w-[1000px] h-auto z-50 pointer-events-none" />
        </div>

        <img ref={repRef} src="/img/rep.png" className="absolute top-0 w-[60%] h-auto z-[100] pointer-events-none" />
      </section>
    </div>
  );
}