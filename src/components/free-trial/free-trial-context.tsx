"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FreeTrialModal } from "@/components/free-trial/free-trial-modal";

interface FreeTrialContextValue {
  openFreeTrial: () => void;
}

const FreeTrialContext = createContext<FreeTrialContextValue | null>(null);

export function useFreeTrial(): FreeTrialContextValue {
  const context = useContext(FreeTrialContext);
  if (!context) {
    throw new Error("useFreeTrial must be used within FreeTrialProvider");
  }
  return context;
}

export function FreeTrialProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openFreeTrial = useCallback(() => setOpen(true), []);
  const closeFreeTrial = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openFreeTrial }), [openFreeTrial]);

  return (
    <FreeTrialContext.Provider value={value}>
      {children}
      <FreeTrialModal open={open} onClose={closeFreeTrial} />
    </FreeTrialContext.Provider>
  );
}
