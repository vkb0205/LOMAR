import React, { createContext, useContext, useState } from 'react';

interface SelectedOptionDetail {
  optionGroupId: string;
  optionGroupName: string;
  valueId: string;
  valueName: string;
  price: number;
}

interface CustomizedService {
  category: string;
  productId: string;
  productName: string;
  basePrice: number;
  totalPrice: number;
  imageUrl: string;
  vendorName: string;
  selectedOptions: SelectedOptionDetail[];
}

interface AppState {
  healthCheckCompleted: boolean;
  setHealthCheckCompleted: (val: boolean) => void;
  customizedServices: Record<string, CustomizedService>;
  saveCustomizedService: (category: string, service: CustomizedService) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthCheckCompleted, setHealthCheckCompleted] = useState(false);
  const [customizedServices, setCustomizedServices] = useState<Record<string, CustomizedService>>(() => {
    try {
      const saved = localStorage.getItem('customizedServices');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveCustomizedService = (category: string, service: CustomizedService) => {
    setCustomizedServices(prev => {
      const updated = { ...prev, [category]: service };
      localStorage.setItem('customizedServices', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{ healthCheckCompleted, setHealthCheckCompleted, customizedServices, saveCustomizedService }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
