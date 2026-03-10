"use client";

import React, { createContext, useContext, useMemo, useState } from 'react';
import { GlossaryDrawer } from './glossary-drawer';
import { getGlossaryEntry } from '../../data/glossary';

type GlossaryContextValue = {
  openGlossary: (term?: string) => void;
  activeTerm?: string;
};

const GlossaryContext = createContext<GlossaryContextValue | null>(null);

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [activeTerm, setActiveTerm] = useState<string | undefined>(undefined);

  const openGlossary = (term?: string) => {
    if (term && getGlossaryEntry(term)) {
      setActiveTerm(term);
    }
    setOpen(true);
  };

  const value = useMemo(
    () => ({
      openGlossary,
      activeTerm,
    }),
    [activeTerm],
  );

  return (
    <GlossaryContext.Provider value={value}>
      {children}
      <GlossaryDrawer
        open={open}
        onOpenChange={setOpen}
        activeTerm={activeTerm}
        onSelectTerm={setActiveTerm}
      />
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  const context = useContext(GlossaryContext);
  if (!context) {
    throw new Error('useGlossary must be used within GlossaryProvider');
  }
  return context;
}
