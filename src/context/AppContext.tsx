import React, { createContext, useContext, useState } from 'react';

interface AppState {
  healthCheckCompleted: boolean;
  setHealthCheckCompleted: (val: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthCheckCompleted, setHealthCheckCompleted] = useState(false);

  return (
    <AppContext.Provider value={{ healthCheckCompleted, setHealthCheckCompleted }}>
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
