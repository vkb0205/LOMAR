import { createContext } from 'react';
import type { CustomizationState } from './types';

export const CustomizationContext = createContext<
  CustomizationState | undefined
>(undefined);
