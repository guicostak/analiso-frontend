"use client";

import React, { useId, useMemo, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { getGlossaryEntry } from '../../data/glossary';
import { useIsMobile } from '../ui/use-mobile';
import { useGlossary } from './glossary-context';

type GlossaryTermProps = {
  term: string;
  display?: string;
  className?: string;
};

export function GlossaryTerm({ term, display, className = '' }: GlossaryTermProps) {
  const entry = useMemo(() => getGlossaryEntry(term), [term]);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { openGlossary } = useGlossary();
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);

  if (!entry) {
    return <span className={className}>{display ?? term}</span>;
  }

  const label = display ?? term;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          aria-describedby={contentId}
          onMouseEnter={() => !isMobile && setOpen(true)}
          onMouseLeave={() => !isMobile && setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget as Node | null;
            if (nextTarget && contentRef.current?.contains(nextTarget)) {
              return;
            }
            setOpen(false);
          }}
          onClick={() => isMobile && setOpen((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setOpen((prev) => !prev);
            }
            if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
          className={`cursor-help underline decoration-dotted decoration-neutral-400 underline-offset-4 ${className}`}
        >
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        id={contentId}
        side="top"
        align="start"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
        className="w-72 rounded-2xl border-neutral-200"
      >
        <div className="space-y-2 text-sm text-neutral-600">
          <p className="text-sm font-semibold text-neutral-900">{entry.term}</p>
          <p>
            <span className="font-medium text-neutral-700">O que é:</span> {entry.whatIs}
          </p>
          <p>
            <span className="font-medium text-neutral-700">Por que importa:</span> {entry.why}
          </p>
          <p>
            <span className="font-medium text-neutral-700">Como ler:</span> {entry.howToRead}
          </p>
          <button
            onClick={() => {
              openGlossary(entry.term);
              setOpen(false);
            }}
            className="text-xs text-[#0E9384] hover:underline"
          >
            Ver no glossário
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
