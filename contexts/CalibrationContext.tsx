// src/contexts/CalibrationContext.tsx
import React, { createContext, useContext, useState } from 'react';

type CalibrationContextType = {
  refAngle: number | null; // en degrés (alpha de référence)
  setRefAngle: (angle: number | null) => void;
};

const CalibrationContext = createContext<CalibrationContextType | undefined>(undefined);

export const CalibrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refAngle, setRefAngle] = useState<number | null>(null);
  return (
    <CalibrationContext.Provider value={{ refAngle, setRefAngle }}>
      {children}
    </CalibrationContext.Provider>
  );
};

export const useCalibration = (): CalibrationContextType => {
  const ctx = useContext(CalibrationContext);
  if (!ctx) throw new Error('useCalibration must be used inside CalibrationProvider');
  return ctx;
};
