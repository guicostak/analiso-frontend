"use client";

/**
 * LuizContext — estado global de abertura/fechamento do Luiz.
 * Fica na camada de layout para que Sidebar, Navbar e qualquer
 * outro componente global possam acionar o assistente sem depender
 * da feature diretamente.
 */

import { createContext, useContext, useState } from "react";

interface LuizContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const LuizContext = createContext<LuizContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function LuizProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LuizContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
      }}
    >
      {children}
    </LuizContext.Provider>
  );
}

/** Hook para acessar o estado de aberto/fechado do Luiz. */
export function useLuizContext() {
  return useContext(LuizContext);
}
