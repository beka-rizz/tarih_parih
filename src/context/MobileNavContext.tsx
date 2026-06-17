"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface MobileNavContextValue {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [hidden, setHiddenState] = useState(false);

  const setHidden = useCallback((value: boolean) => {
    setHiddenState(value);
  }, []);

  const value = useMemo(
    () => ({ hidden, setHidden }),
    [hidden, setHidden],
  );

  return (
    <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return context;
}
