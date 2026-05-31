'use client';

import { useState } from 'react';
import { HeroTitle } from '@/components/HeroTitle';
import { ScrollPanels } from '@/components/ScrollPanels';
import { RadioExperience } from '@/components/RadioExperience';
import { OverlapSections } from '@/components/OverlapSections';
import { NewspaperFlip } from '@/components/NewspaperFlip';
import { useLenis } from '@/components/SmoothScrollProvider';
import { config } from '@/lib/config';

export default function Page() {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [returnNonce, setReturnNonce] = useState(0);
  const lenis = useLenis();

  // Az overlap-intró auto-play vége → görgessünk tovább az újságra.
  const handleIntroComplete = () => {
    const target = config.f8Transition.newspaperAnchorSelector;
    if (lenis) {
      lenis.scrollTo(target, { duration: config.f8Transition.duration });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // "Vissza a rádióhoz": returnNonce++ (overlap reverse + újság flip(0) + F8 felenged),
  // és felgörgetés a rádióra. Az activeSection NEM nullázódik (a rádió-jelenet megmarad,
  // a zene szól tovább, a ScrollPanels nem jön vissza).
  const handleReturn = () => {
    setReturnNonce((n) => n + 1);
    const target = config.f8Transition.radioAnchorSelector;
    if (lenis) {
      lenis.scrollTo(target, { duration: config.f8Transition.duration });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="relative bg-black min-h-screen w-full overflow-x-hidden">
      <section className="relative w-full h-screen">
        <HeroTitle />
      </section>

      {activeSection === null && (
        <section className="relative w-full">
          <ScrollPanels panels={config.scrollPanels} />
        </section>
      )}

      <section id="section-radio" className="relative w-full h-screen">
        <RadioExperience onF8Activate={(s) => setActiveSection(s)} returnNonce={returnNonce} />
      </section>

      {activeSection !== null && (
        <>
          <section id="section-overlap" className="relative z-40 w-full bg-black">
            <OverlapSections
              key={`o-${activeSection}`}
              sectionId={activeSection}
              returnNonce={returnNonce}
              onIntroComplete={handleIntroComplete}
            />
          </section>
          <section id="section-ujsag" className="relative z-50 w-full bg-black">
            <NewspaperFlip key={`n-${activeSection}`} sectionId={activeSection} returnNonce={returnNonce} />
            <button
              type="button"
              onClick={handleReturn}
              className="absolute bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-chrono-cyan/60 bg-black/70 px-6 py-3 text-sm uppercase tracking-widest text-chrono-cyan backdrop-blur transition hover:bg-chrono-cyan/20"
            >
              ⟵ Vissza a rádióhoz
            </button>
          </section>
        </>
      )}
    </main>
  );
}
