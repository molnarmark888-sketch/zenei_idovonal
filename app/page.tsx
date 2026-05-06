'use client';

import { useState } from 'react';
import { HeroTitle } from '@/components/HeroTitle';
import { ScrollPanels } from '@/components/ScrollPanels';
import { RadioExperience } from '@/components/RadioExperience';
import { ParallaxExperience } from '@/components/ParallaxExperience';
import { config } from '@/lib/config';

export default function Page() {
  const [isActivated, setIsActivated] = useState(false);

  return (
    // A min-h-screen és a relative flow biztosítja, hogy legyen görgetősáv
    <main className="relative bg-black min-h-screen w-full overflow-x-hidden">
      
      {/* 1. SZEKCIÓ: HERO */}
      <section className="relative w-full h-screen">
        <HeroTitle />
      </section>

      {/* 2. SZEKCIÓ: PANELEK */}
      <section className="relative w-full">
        <ScrollPanels panels={config.scrollPanels} />
      </section>

      {/* 3. SZEKCIÓ: RÁDIÓ */}
      <section id="section-radio" className="relative w-full h-screen">
        <RadioExperience onSelectImage={() => setIsActivated(true)} />
      </section>

      {/* 4. SZEKCIÓ: PARALLAX (Csak ha aktiválva van) */}
      {isActivated && (
        <section className="relative z-50 w-full bg-black mt-[-20vh]">
          <ParallaxExperience />
        </section>
      )}

      {/* Biztonsági tartalék, hogy biztosan lehessen görgetni */}
      <div className="h-[10vh] bg-black" />
    </main>
  );
}
