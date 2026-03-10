"use client";

import React, { useMemo } from 'react';
import { getGlossaryEntry, getGlossaryTokens } from '../../data/glossary';
import { GlossaryTerm } from './glossary-term';

type GlossaryTextProps = {
  text: string;
  className?: string;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function GlossaryText({ text, className = '' }: GlossaryTextProps) {
  const tokens = useMemo(() => {
    return getGlossaryTokens()
      .slice()
      .sort((a, b) => b.length - a.length)
      .map(escapeRegex);
  }, []);

  const regex = useMemo(() => {
    if (tokens.length === 0) return null;
    return new RegExp(`(${tokens.join('|')})`, 'gi');
  }, [tokens]);

  if (!regex) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(regex).filter((part) => part.length > 0);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const entry = getGlossaryEntry(part);
        if (!entry) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        return <GlossaryTerm key={`${part}-${index}`} term={entry.term} display={part} />;
      })}
    </span>
  );
}
