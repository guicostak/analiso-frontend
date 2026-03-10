"use client";

import React from 'react';
import { glossaryData, getGlossaryEntry } from '../../data/glossary';
import { useIsMobile } from '../ui/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

type GlossaryDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTerm?: string;
  onSelectTerm: (term: string) => void;
};

function GlossaryContent({
  activeTerm,
  onSelectTerm,
}: {
  activeTerm?: string;
  onSelectTerm: (term: string) => void;
}) {
  const activeEntry = activeTerm ? getGlossaryEntry(activeTerm) : glossaryData[0];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-4 space-y-3 border-b border-neutral-200">
        {activeEntry ? (
          <>
            <div>
              <p className="text-xs text-neutral-500">Termo</p>
              <p className="text-lg font-semibold text-neutral-900">{activeEntry.term}</p>
            </div>
            <div className="text-sm text-neutral-600 space-y-2">
              <p>
                <span className="font-medium text-neutral-700">O que é:</span> {activeEntry.whatIs}
              </p>
              <p>
                <span className="font-medium text-neutral-700">Por que importa:</span> {activeEntry.why}
              </p>
              <p>
                <span className="font-medium text-neutral-700">Como ler:</span> {activeEntry.howToRead}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500">Selecione um termo para ver detalhes.</p>
        )}
      </div>
      <div className="px-4 py-4">
        <p className="text-xs text-neutral-500 mb-2">Todos os termos</p>
        <div className="grid grid-cols-1 gap-2">
          {glossaryData.map((entry) => (
            <button
              key={entry.term}
              onClick={() => onSelectTerm(entry.term)}
              className={`px-3 py-2 rounded-xl text-left text-sm border transition ${
                activeEntry?.term === entry.term
                  ? 'border-[#0E9384] bg-[#E7F6F3] text-[#0E9384]'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {entry.term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GlossaryDrawer({ open, onOpenChange, activeTerm, onSelectTerm }: GlossaryDrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-white border-neutral-200">
          <DrawerHeader>
            <DrawerTitle className="text-base font-semibold text-neutral-900">Glossário</DrawerTitle>
          </DrawerHeader>
          <GlossaryContent activeTerm={activeTerm} onSelectTerm={onSelectTerm} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] bg-white border-neutral-200">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-neutral-900">Glossário</SheetTitle>
        </SheetHeader>
        <GlossaryContent activeTerm={activeTerm} onSelectTerm={onSelectTerm} />
      </SheetContent>
    </Sheet>
  );
}
