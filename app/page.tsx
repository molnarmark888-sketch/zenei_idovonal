import { config } from '@/lib/config';
import { HeroTitle } from '@/components/HeroTitle';
import { ScrollPanels } from '@/components/ScrollPanels';
import { RadioExperience } from '@/components/RadioExperience';

export default function Home() {
  return (
    <div id="scroll-wrapper">
      <section className="panel">
        <HeroTitle />
      </section>
      <section className="panel">
        <ScrollPanels panels={config.scrollPanels} />
      </section>
      <div className="spacer-short" />
      <section className="panel" id="section-radio">
        <RadioExperience />
      </section>
    </div>
  );
}
