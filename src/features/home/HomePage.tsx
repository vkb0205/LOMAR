import FloatingChat from '../chat/components/FloatingChat';
import { DevelopmentSection } from './components/DevelopmentSection';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';

export default function Home() {
  return (
    <div className="w-full flex flex-col font-sans pb-20 animate-in fade-in duration-500 overflow-hidden relative bg-[#fffdfa]">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-multiply" />
      <HeroSection />
      <StorySection />
      <DevelopmentSection />
      <FloatingChat />
    </div>
  );
}
