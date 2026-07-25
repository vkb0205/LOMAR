import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CustomizationContext } from './CustomizationContext';
import type { CustomizationState, CustomizedService } from './types';

const CUSTOMIZED_SERVICES_STORAGE_KEY = 'customizedServices';

function loadCustomizedServices(): Record<string, CustomizedService> {
  if (typeof window === 'undefined') return {};

  try {
    const saved = window.localStorage.getItem(CUSTOMIZED_SERVICES_STORAGE_KEY);
    return saved
      ? (JSON.parse(saved) as Record<string, CustomizedService>)
      : {};
  } catch {
    return {};
  }
}

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [customizedServices, setCustomizedServices] = useState<
    Record<string, CustomizedService>
  >(loadCustomizedServices);

  const saveCustomizedService = useCallback(
    (category: string, service: CustomizedService) => {
      setCustomizedServices((current) => {
        const updated = { ...current, [category]: service };
        window.localStorage.setItem(
          CUSTOMIZED_SERVICES_STORAGE_KEY,
          JSON.stringify(updated)
        );
        return updated;
      });
    },
    []
  );

  const value = useMemo<CustomizationState>(
    () => ({ customizedServices, saveCustomizedService }),
    [customizedServices, saveCustomizedService]
  );

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
}
