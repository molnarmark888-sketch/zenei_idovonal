'use client';

import { useState } from 'react';
import { HeroTitle } from '@/components/HeroTitle';
import { ScrollPanels } from '@/components/ScrollPanels';
import { RadioExperience } from '@/components/RadioExperience';
import { ParallaxExperience } from '@/components/ParallaxExperience';
import { NewspaperFlip } from '@/components/NewspaperFlip';
import { config } from '@/lib/config';

export default function Page() {
  const [activeSection, setActiveSection] = useState<number | null>(null);

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
        <RadioExperience onF8Activate={(s) => setActiveSection(s)} />
      </section>

      {activeSection !== null && (
        <>
          <section id="section-parallax" className="relative z-40 w-full bg-black">
            <ParallaxExperience key={`p-${activeSection}`} sectionId={activeSection} />
          </section>
          <section id="section-ujsag" className="relative z-50 w-full bg-black">
            <NewspaperFlip key={`n-${activeSection}`} sectionId={activeSection} />
          </section>
        </>
      )}
    </main>
  );
}
