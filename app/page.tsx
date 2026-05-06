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
    <main className="relative bg-black min-h-screen w-full overflow-x-hidden">
      <section className="relative w-full h-screen">
        <HeroTitle />
      </section>

      {!isActivated && (
        <section className="relative w-full">
          <ScrollPanels panels={config.scrollPanels} />
        </section>
      )}

      <section id="section-radio" className="relative w-full h-screen">
        <RadioExperience onF8Activate={() => setIsActivated(true)} />
      </section>

      {isActivated && (
        <section id="section-parallax" className="relative z-50 w-full bg-black">
          <ParallaxExperience />
        </section>
      )}

      <div className="h-[10vh] bg-black" />
    </main>
  );
}
