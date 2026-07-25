import type { LucideIcon } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export type HomeJourneyStop = {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  to: string;
};

export type HomePillar = {
  title: string;
  desc: string;
  img: string;
  icon: LucideIcon;
  color: string;
};

export type HomeMilestone = {
  year: string;
  title: string;
  icon: LucideIcon;
};
