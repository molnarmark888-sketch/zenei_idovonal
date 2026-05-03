'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const TITLE = 'CHRONO BOOM';

export function HeroTitle() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.innerHTML = '';
    for (const ch of TITLE) {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? ' ' : ch;
      span.classList.add('chrono-char');
      el.appendChild(span);
    }
    gsap.to(el.querySelectorAll('.chrono-char'), {
      opacity: 1,
      y: 0,
      stagger: 0.05,
      duration: 0.8,
    });
  }, []);

  return (
    <div id="chrono-title-wrapper">
      <h1 ref={titleRef} id="chrono-title">
        {TITLE}
      </h1>
    </div>
  );
}
