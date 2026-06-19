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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'bride' | 'groom' | 'planner';
  avatarUrl?: string;
}

interface AppState {
  healthCheckCompleted: boolean;
  setHealthCheckCompleted: (val: boolean) => void;
  customizedServices: Record<string, CustomizedService>;
  saveCustomizedService: (category: string, service: CustomizedService) => void;
  user: UserProfile | null;
  login: (email: string, name?: string, role?: 'bride' | 'groom' | 'planner') => void;
  logout: () => void;
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

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('authUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveCustomizedService = (category: string, service: CustomizedService) => {
    setCustomizedServices(prev => {
      const updated = { ...prev, [category]: service };
      localStorage.setItem('customizedServices', JSON.stringify(updated));
      return updated;
    });
  };

  const login = (email: string, name = 'Người Dùng', role: 'bride' | 'groom' | 'planner' = 'bride') => {
    const newUser: UserProfile = {
      id: 'U01',
      name,
      email,
      role,
      avatarUrl: role === 'bride'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
        : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120'
    };
    setUser(newUser);
    localStorage.setItem('authUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AppContext.Provider value={{
      healthCheckCompleted,
      setHealthCheckCompleted,
      customizedServices,
      saveCustomizedService,
      user,
      login,
      logout
    }}>
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
