import { DevelopmentSection } from './components/DevelopmentSection';
import { DistrictSection } from './components/DistrictSection';
import { HeroSection } from './components/HeroSection';
import { JourneyCTA } from './components/JourneyCTA';
import { ServiceTilesSection } from './components/ServiceTilesSection';
import { StorySection } from './components/StorySection';

export default function Home() {
  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-canvas pb-8 font-sans">
      <HeroSection />
      <ServiceTilesSection />
      <JourneyCTA />
      <DistrictSection />
      <StorySection />
      <DevelopmentSection />
    </div>
  );
}
