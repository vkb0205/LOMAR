import { useContext } from 'react';
import { CustomizationContext } from '../CustomizationContext';
import type { CustomizationState } from '../types';

export function useCustomization(): CustomizationState {
  const context = useContext(CustomizationContext);
  if (context === undefined) {
    throw new Error(
      'useCustomization must be used within a CustomizationProvider'
    );
  }
  return context;
}
