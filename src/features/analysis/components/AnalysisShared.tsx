'use client';

import React, { useState } from 'react';
import { Bookmark, ChevronRight } from 'lucide-react';
import type { DimensionScore, AnalysisData, AnalysisTab } from '../interfaces';
import { DIMENSION_INTRO } from '../constants/colors';
import { safeN, safeNbr } from '../utils/formatters';

// ─── WatchlistButton ──────────────────────────────────────────────────────────

export function FavoriteButton({ ticker }: { ticker: string }) {
  const key = `fav:${ticker}`;
  const [faved, setFaved] = useState(() => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  });
  const toggle = () => {
    const next = !faved;
    setFaved(next);
    try { next ? localStorage.setItem(key, '1') : localStorage.removeItem(key); } catch { /* noop */ }
  };
  return (
    <button
      onClick={toggle}
      title={faved ? 'Remover da watchlist' : 'Adicionar à watchlist'}
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
        faved
          ? 'text-brand-text bg-brand-surface'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <Bookmark className="w-4 h-4" fill={faved ? 'currentColor' : 'none'} />
    </button>
  );
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────

export function ScoreBar({ score, max = 6, color }: { score: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-4 rounded-sm"
          style={{ backgroundColor: i < score ? color : 'var(--border)' }}
        />
      ))}
      <span className="ml-2 text-sm font-semibold" style={{ color }}>{score}/{max}</span>
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

// DESIGN CHANGE — SectionCard with refined elevation, border, and subtle hover lift
export function SectionCard({ id, title, subtitle, children, className = '' }: { id?: string; title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div id={id} className={`analysis-card p-6 scroll-mt-24 ${className}`}>
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-foreground tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── DimensionIntroCard ───────────────────────────────────────────────────────

// DESIGN CHANGE — DimensionIntroCard with colored left accent, refined icon treatment
export function DimensionIntroCard({ dimension, title, icon, color }: {
  dimension: string; title: string; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="analysis-card px-6 py-5 relative overflow-hidden">
      {/* Subtle colored top edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}40)` }} />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
          <span className="scale-[0.85]" style={{ color }}>{icon}</span>
        </div>
        <h2 className="text-[15px] font-semibold text-foreground tracking-tight">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{DIMENSION_INTRO[dimension]}</p>
    </div>
  );
}

// ─── DimensionScoreCard ───────────────────────────────────────────────────────

// DESIGN CHANGE — DimensionScoreCard with refined header, subtle color accent, improved check items
export function DimensionScoreCard({ label, score, max = 6, checks, color, anchors }: {
  label: string; score: number; max?: number; checks: DimensionScore['checks']; color: string;
  anchors?: (string | null)[];
}) {
  const scrollTo = (id: string | null) => {
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="analysis-card overflow-hidden">
      {/* DESIGN CHANGE — Score header with colored top accent and larger, bolder score */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}30)` }} />
        <div className="flex items-center justify-between px-6 pt-7 pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${color}99` }}>
              Pontuação de {label}
            </p>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-[42px] font-bold leading-none text-foreground">{score}</span>
              <span className="text-sm text-muted-foreground font-light">de {max}</span>
            </div>
          </div>
          {/* DESIGN CHANGE — Score dots with smooth fill and ring treatment */}
          <div className="flex gap-2">
            {Array.from({ length: max }).map((_, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: i < score ? color : 'var(--muted)',
                  boxShadow: i < score ? `0 0 0 2px ${color}20` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border mx-6" />

      {/* DESIGN CHANGE — Check items with improved spacing and hover effect */}
      <div className="py-1">
        {checks.map((check, idx) => {
          const anchor = anchors?.[idx] ?? null;
          return (
            <button
              key={check.id}
              type="button"
              onClick={() => scrollTo(anchor)}
              disabled={!anchor}
              className={`w-full flex items-center gap-4 px-6 py-3.5 text-left transition-all duration-200 ${
                anchor ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className="w-[3px] self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: check.passed ? '#2EAA8A' : 'var(--border)' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-foreground">{check.label}</span>
                  {check.value && (
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${
                      check.passed ? 'bg-success-surface text-success-text' : 'bg-muted text-muted-foreground'
                    }`}>
                      {check.value}
                    </span>
                  )}
                  {check.threshold && (
                    <span className="text-xs text-muted-foreground">{check.threshold}</span>
                  )}
                </div>
                {check.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-5">{check.description}</p>
                )}
              </div>
              {anchor && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── CheckList ────────────────────────────────────────────────────────────────

export function CheckList({ checks }: { checks: DimensionScore['checks'] }) {
  return (
    <div className="space-y-2">
      {checks.map((check) => (
        <div key={check.id} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div
            className="w-[3px] self-stretch rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: check.passed ? '#2EAA8A' : '#D1D5DB' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">{check.label}</span>
              {check.value && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${check.passed ? 'bg-success-surface text-success-text' : 'bg-muted text-muted-foreground'}`}>
                  {check.value}
                </span>
              )}
              {check.threshold && (
                <span className="text-xs text-muted-foreground">{check.threshold}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{check.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── pillarStatus ─────────────────────────────────────────────────────────────

export function pillarStatus(score: number): { label: string; color: string; bg: string; dot: string } {
  if (score >= 5) return { label: 'Forte',       color: 'text-success-text', bg: 'bg-success-surface', dot: 'bg-emerald-400' };
  if (score >= 3) return { label: 'Equilibrado', color: 'text-muted-foreground',   bg: 'bg-muted',  dot: 'bg-muted-foreground'   };
  if (score >= 2) return { label: 'Atenção',     color: 'text-warning-text',   bg: 'bg-warning-surface',   dot: 'bg-amber-400'   };
  return             { label: 'Pressionado', color: 'text-danger-text',    bg: 'bg-danger-surface',    dot: 'bg-rose-400'    };
}

// ─── CriteriaIcon ─────────────────────────────────────────────────────────────

export const PATH_FAIL = "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM12 10L8.70711 6.70711C8.31658 6.31658 7.68342 6.31658 7.29289 6.70711L6.70711 7.29289C6.31658 7.68342 6.31658 8.31658 6.70711 8.70711L10 12L6.70711 15.2929C6.31658 15.6834 6.31658 16.3166 6.70711 16.7071L7.29289 17.2929C7.68342 17.6834 8.31658 17.6834 8.70711 17.2929L12 14L15.2929 17.2929C15.6834 17.6834 16.3166 17.6834 16.7071 17.2929L17.2929 16.7071C17.6834 16.3166 17.6834 15.6834 17.2929 15.2929L14 12L17.2929 8.70711C17.6834 8.31658 17.6834 7.68342 17.2929 7.29289L16.7071 6.70711C16.3166 6.31658 15.6834 6.31658 15.2929 6.70711L12 10Z";
export const PATH_PASS = "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM5.70711 13.7071L9.29289 17.2929C9.68342 17.6834 10.3166 17.6834 10.7071 17.2929L18.2929 9.70711C18.6834 9.31658 18.6834 8.68342 18.2929 8.29289L17.7071 7.70711C17.3166 7.31658 16.6834 7.31658 16.2929 7.70711L10 14L7.70711 11.7071C7.31658 11.3166 6.68342 11.3166 6.29289 11.7071L5.70711 12.2929C5.31658 12.6834 5.31658 13.3166 5.70711 13.7071Z";
export const PATH_CHEVRON_ROW = "M9.0474 7.05025C8.65688 7.44078 8.65688 8.07394 9.0474 8.46447L12.5829 12L9.0474 15.5355C8.65688 15.9261 8.65688 16.5592 9.0474 16.9497C9.43793 17.3403 10.0711 17.3403 10.4616 16.9497L14.7043 12.7071C15.0948 12.3166 15.0948 11.6834 14.7043 11.2929L10.4616 7.05025C10.0711 6.65973 9.43793 6.65973 9.0474 7.05025Z";

export function CriteriaIcon({ passed }: { passed: boolean; size?: number }) {
  return (
    <div
      className="rounded-full flex-shrink-0 mt-1"
      style={{ width: 8, height: 8, backgroundColor: passed ? '#2EAA8A' : '#D1D5DB' }}
    />
  );
}

// ─── Gauge helpers ────────────────────────────────────────────────────────────

/** 90 arc-segment path `d` strings that make up the gauge colour ring */
export const GAUGE_SEGMENT_PATHS: string[] = [
  "M-120,0A120,120,0,0,1,-119.904,-4.788L-107.914,-4.309A108,108,0,0,0,-108,0Z",
  "M-119.927,-4.188A120,120,0,0,1,-119.664,-8.969L-107.698,-8.072A108,108,0,0,0,-107.934,-3.769Z",
  "M-119.708,-8.371A120,120,0,0,1,-119.278,-13.14L-107.351,-11.826A108,108,0,0,0,-107.737,-7.534Z",
  "M-119.343,-12.543A120,120,0,0,1,-118.747,-17.295L-106.872,-15.565A108,108,0,0,0,-107.408,-11.289Z",
  "M-118.832,-16.701A120,120,0,0,1,-118.071,-21.428L-106.264,-19.286A108,108,0,0,0,-106.949,-15.031Z",
  "M-118.177,-20.838A120,120,0,0,1,-117.251,-25.536L-105.526,-22.982A108,108,0,0,0,-106.359,-18.754Z",
  "M-117.378,-24.949A120,120,0,0,1,-116.289,-29.612L-104.66,-26.651A108,108,0,0,0,-105.64,-22.454Z",
  "M-116.435,-29.031A120,120,0,0,1,-115.185,-33.653L-103.666,-30.288A108,108,0,0,0,-104.792,-26.128Z",
  "M-115.351,-33.076A120,120,0,0,1,-113.94,-37.652L-102.546,-33.887A108,108,0,0,0,-103.816,-29.769Z",
  "M-114.127,-37.082A120,120,0,0,1,-112.556,-41.606L-101.301,-37.445A108,108,0,0,0,-102.714,-33.374Z",
  "M-112.763,-41.042A120,120,0,0,1,-111.036,-45.509L-99.932,-40.958A108,108,0,0,0,-101.487,-36.938Z",
  "M-111.262,-44.953A120,120,0,0,1,-109.38,-49.356L-98.442,-44.42A108,108,0,0,0,-100.136,-40.458Z",
  "M-109.625,-48.808A120,120,0,0,1,-107.591,-53.143L-96.832,-47.829A108,108,0,0,0,-98.663,-43.928Z",
  "M-107.855,-52.605A120,120,0,0,1,-105.671,-56.866L-95.104,-51.179A108,108,0,0,0,-97.07,-47.344Z",
  "M-105.954,-56.337A120,120,0,0,1,-103.622,-60.519L-93.26,-54.467A108,108,0,0,0,-95.358,-50.703Z",
  "M-103.923,-60A120,120,0,0,1,-101.447,-64.098L-91.302,-57.689A108,108,0,0,0,-93.531,-54Z",
  "M-101.766,-63.59A120,120,0,0,1,-99.148,-67.6L-89.233,-60.84A108,108,0,0,0,-91.589,-57.231Z",
  "M-99.485,-67.103A120,120,0,0,1,-96.728,-71.019L-87.055,-63.917A108,108,0,0,0,-89.536,-60.393Z",
  "M-97.082,-70.534A120,120,0,0,1,-94.191,-74.351L-84.772,-66.916A108,108,0,0,0,-87.374,-63.481Z",
  "M-94.561,-73.879A120,120,0,0,1,-91.539,-77.593L-82.385,-69.834A108,108,0,0,0,-85.105,-66.491Z",
  "M-91.925,-77.135A120,120,0,0,1,-88.775,-80.741L-79.897,-72.666A108,108,0,0,0,-82.733,-69.421Z",
  "M-89.177,-80.296A120,120,0,0,1,-85.903,-83.79L-77.313,-75.411A108,108,0,0,0,-80.26,-72.266Z",
  "M-86.321,-83.359A120,120,0,0,1,-82.926,-86.736L-74.634,-78.063A108,108,0,0,0,-77.689,-75.023Z",
  "M-83.359,-86.321A120,120,0,0,1,-79.849,-89.578L-71.864,-80.62A108,108,0,0,0,-75.023,-77.689Z",
  "M-80.296,-89.177A120,120,0,0,1,-76.674,-92.31L-69.007,-83.079A108,108,0,0,0,-72.266,-80.26Z",
  "M-77.135,-91.925A120,120,0,0,1,-73.406,-94.93L-66.065,-85.437A108,108,0,0,0,-69.421,-82.733Z",
  "M-73.879,-94.561A120,120,0,0,1,-70.048,-97.433L-63.043,-87.69A108,108,0,0,0,-66.491,-85.105Z",
  "M-70.534,-97.082A120,120,0,0,1,-66.605,-99.819L-59.944,-89.837A108,108,0,0,0,-63.481,-87.374Z",
  "M-67.103,-99.485A120,120,0,0,1,-63.081,-102.082L-56.773,-91.874A108,108,0,0,0,-60.393,-89.536Z",
  "M-63.59,-101.766A120,120,0,0,1,-59.48,-104.222L-53.532,-93.8A108,108,0,0,0,-57.231,-91.589Z",
  "M-60,-103.923A120,120,0,0,1,-55.806,-106.234L-50.226,-95.611A108,108,0,0,0,-54,-93.531Z",
  "M-56.337,-105.954A120,120,0,0,1,-52.065,-108.117L-46.858,-97.305A108,108,0,0,0,-50.703,-95.358Z",
  "M-52.605,-107.855A120,120,0,0,1,-48.26,-109.868L-43.434,-98.881A108,108,0,0,0,-47.344,-97.07Z",
  "M-48.808,-109.625A120,120,0,0,1,-44.396,-111.485L-39.956,-100.337A108,108,0,0,0,-43.928,-98.663Z",
  "M-44.953,-111.262A120,120,0,0,1,-40.478,-112.967L-36.43,-101.67A108,108,0,0,0,-40.458,-100.136Z",
  "M-41.042,-112.763A120,120,0,0,1,-36.511,-114.311L-32.86,-102.88A108,108,0,0,0,-36.938,-101.487Z",
  "M-37.082,-114.127A120,120,0,0,1,-32.499,-115.515L-29.249,-103.964A108,108,0,0,0,-33.374,-102.714Z",
  "M-33.076,-115.351A120,120,0,0,1,-28.448,-116.579L-25.603,-104.921A108,108,0,0,0,-29.769,-103.816Z",
  "M-29.031,-116.435A120,120,0,0,1,-24.362,-117.501L-21.926,-105.751A108,108,0,0,0,-26.128,-104.792Z",
  "M-24.949,-117.378A120,120,0,0,1,-20.247,-118.28L-18.222,-106.452A108,108,0,0,0,-22.454,-105.64Z",
  "M-20.838,-118.177A120,120,0,0,1,-16.106,-118.914L-14.496,-107.023A108,108,0,0,0,-18.754,-106.359Z",
  "M-16.701,-118.832A120,120,0,0,1,-11.947,-119.404L-10.752,-107.463A108,108,0,0,0,-15.031,-106.949Z",
  "M-12.543,-119.343A120,120,0,0,1,-7.772,-119.748L-6.995,-107.773A108,108,0,0,0,-11.289,-107.408Z",
  "M-8.371,-119.708A120,120,0,0,1,-3.588,-119.946L-3.229,-107.952A108,108,0,0,0,-7.534,-107.737Z",
  "M-4.188,-119.927A120,120,0,0,1,0.6,-119.999L0.54,-107.999A108,108,0,0,0,-3.769,-107.934Z",
  "M0,-120A120,120,0,0,1,4.788,-119.904L4.309,-107.914A108,108,0,0,0,0,-108Z",
  "M4.188,-119.927A120,120,0,0,1,8.969,-119.664L8.072,-107.698A108,108,0,0,0,3.769,-107.934Z",
  "M8.371,-119.708A120,120,0,0,1,13.14,-119.278L11.826,-107.351A108,108,0,0,0,7.534,-107.737Z",
  "M12.543,-119.343A120,120,0,0,1,17.295,-118.747L15.565,-106.872A108,108,0,0,0,11.289,-107.408Z",
  "M16.701,-118.832A120,120,0,0,1,21.428,-118.071L19.286,-106.264A108,108,0,0,0,15.031,-106.949Z",
  "M20.838,-118.177A120,120,0,0,1,25.536,-117.251L22.982,-105.526A108,108,0,0,0,18.754,-106.359Z",
  "M24.949,-117.378A120,120,0,0,1,29.612,-116.289L26.651,-104.66A108,108,0,0,0,22.454,-105.64Z",
  "M29.031,-116.435A120,120,0,0,1,33.653,-115.185L30.288,-103.666A108,108,0,0,0,26.128,-104.792Z",
  "M33.076,-115.351A120,120,0,0,1,37.652,-113.94L33.887,-102.546A108,108,0,0,0,29.769,-103.816Z",
  "M37.082,-114.127A120,120,0,0,1,41.606,-112.556L37.445,-101.301A108,108,0,0,0,33.374,-102.714Z",
  "M41.042,-112.763A120,120,0,0,1,45.509,-111.036L40.958,-99.932A108,108,0,0,0,36.938,-101.487Z",
  "M44.953,-111.262A120,120,0,0,1,49.356,-109.38L44.42,-98.442A108,108,0,0,0,40.458,-100.136Z",
  "M48.808,-109.625A120,120,0,0,1,53.143,-107.591L47.829,-96.832A108,108,0,0,0,43.928,-98.663Z",
  "M52.605,-107.855A120,120,0,0,1,56.866,-105.671L51.179,-95.104A108,108,0,0,0,47.344,-97.07Z",
  "M56.337,-105.954A120,120,0,0,1,60.519,-103.622L54.467,-93.26A108,108,0,0,0,50.703,-95.358Z",
  "M60,-103.923A120,120,0,0,1,64.098,-101.447L57.689,-91.302A108,108,0,0,0,54,-93.531Z",
  "M63.59,-101.766A120,120,0,0,1,67.6,-99.148L60.84,-89.233A108,108,0,0,0,57.231,-91.589Z",
  "M67.103,-99.485A120,120,0,0,1,71.019,-96.728L63.917,-87.055A108,108,0,0,0,60.393,-89.536Z",
  "M70.534,-97.082A120,120,0,0,1,74.351,-94.191L66.916,-84.772A108,108,0,0,0,63.481,-87.374Z",
  "M73.879,-94.561A120,120,0,0,1,77.593,-91.539L69.834,-82.385A108,108,0,0,0,66.491,-85.105Z",
  "M77.135,-91.925A120,120,0,0,1,80.741,-88.775L72.666,-79.897A108,108,0,0,0,69.421,-82.733Z",
  "M80.296,-89.177A120,120,0,0,1,83.79,-85.903L75.411,-77.313A108,108,0,0,0,72.266,-80.26Z",
  "M83.359,-86.321A120,120,0,0,1,86.736,-82.926L78.063,-74.634A108,108,0,0,0,75.023,-77.689Z",
  "M86.321,-83.359A120,120,0,0,1,89.578,-79.849L80.62,-71.864A108,108,0,0,0,77.689,-75.023Z",
  "M89.177,-80.296A120,120,0,0,1,92.31,-76.674L83.079,-69.007A108,108,0,0,0,80.26,-72.266Z",
  "M91.925,-77.135A120,120,0,0,1,94.93,-73.406L85.437,-66.065A108,108,0,0,0,82.733,-69.421Z",
  "M94.561,-73.879A120,120,0,0,1,97.433,-70.048L87.69,-63.043A108,108,0,0,0,85.105,-66.491Z",
  "M97.082,-70.534A120,120,0,0,1,99.819,-66.605L89.837,-59.944A108,108,0,0,0,87.374,-63.481Z",
  "M99.485,-67.103A120,120,0,0,1,102.082,-63.081L91.874,-56.773A108,108,0,0,0,89.536,-60.393Z",
  "M101.766,-63.59A120,120,0,0,1,104.222,-59.48L93.8,-53.532A108,108,0,0,0,91.589,-57.231Z",
  "M103.923,-60A120,120,0,0,1,106.234,-55.806L95.611,-50.226A108,108,0,0,0,93.531,-54Z",
  "M105.954,-56.337A120,120,0,0,1,108.117,-52.065L97.305,-46.858A108,108,0,0,0,95.358,-50.703Z",
  "M107.855,-52.605A120,120,0,0,1,109.868,-48.26L98.881,-43.434A108,108,0,0,0,97.07,-47.344Z",
  "M109.625,-48.808A120,120,0,0,1,111.485,-44.396L100.337,-39.956A108,108,0,0,0,98.663,-43.928Z",
  "M111.262,-44.953A120,120,0,0,1,112.967,-40.478L101.67,-36.43A108,108,0,0,0,100.136,-40.458Z",
  "M112.763,-41.042A120,120,0,0,1,114.311,-36.511L102.88,-32.86A108,108,0,0,0,101.487,-36.938Z",
  "M114.127,-37.082A120,120,0,0,1,115.515,-32.499L103.964,-29.249A108,108,0,0,0,102.714,-33.374Z",
  "M115.351,-33.076A120,120,0,0,1,116.579,-28.448L104.921,-25.603A108,108,0,0,0,103.816,-29.769Z",
  "M116.435,-29.031A120,120,0,0,1,117.501,-24.362L105.751,-21.926A108,108,0,0,0,104.792,-26.128Z",
  "M117.378,-24.949A120,120,0,0,1,118.28,-20.247L106.452,-18.222A108,108,0,0,0,105.64,-22.454Z",
  "M118.177,-20.838A120,120,0,0,1,118.914,-16.106L107.023,-14.496A108,108,0,0,0,106.359,-18.754Z",
  "M118.832,-16.701A120,120,0,0,1,119.404,-11.947L107.463,-10.752A108,108,0,0,0,106.949,-15.031Z",
  "M119.343,-12.543A120,120,0,0,1,119.748,-7.772L107.773,-6.995A108,108,0,0,0,107.408,-11.289Z",
  "M119.708,-8.371A120,120,0,0,1,119.946,-3.588L107.952,-3.229A108,108,0,0,0,107.737,-7.534Z",
  "M119.927,-4.188A120,120,0,0,1,119.999,0.6L107.999,0.54A108,108,0,0,0,107.934,-3.769Z",
];

/** Interpolated colour for gauge segment index i (0=red-left, 89=green-right) */
export function gaugeSegmentColor(i: number): string {
  const t = i / 89;
  const h = (t * 151).toFixed(1);
  const s = (77 - t * 14).toFixed(1);
  const l = (58 - t * 10).toFixed(1);
  return `hsl(${h},${s}%,${l}%)`;
}

/** Convert polar angle (degrees, 0=top, CW) to Cartesian from origin */
export function gaugePolar(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: r * Math.sin(rad), y: -r * Math.cos(rad) };
}

/** Build a donut-sector SVG path from -90° to endAngleDeg */
export function gaugeSectorPath(outerR: number, innerR: number, endAngleDeg: number): string {
  const eo = gaugePolar(endAngleDeg, outerR);
  const ei = gaugePolar(endAngleDeg, innerR);
  const span = endAngleDeg - (-90);
  const lg  = span > 180 ? 1 : 0;
  return [
    `M${-outerR},0`,
    `A${outerR},${outerR},0,${lg},1,${eo.x.toFixed(3)},${eo.y.toFixed(3)}`,
    `L${ei.x.toFixed(3)},${ei.y.toFixed(3)}`,
    `A${innerR},${innerR},0,${lg},0,${-innerR},0`,
    'Z',
  ].join('');
}

export const GAUGE_AXIS_TICKS = [
  { label: '0%',    angleDeg: -90 },
  { label: '10%',   angleDeg: -45 },
  { label: '20%',   angleDeg:   0 },
  { label: '30%',   angleDeg:  45 },
  { label: '40%',   angleDeg:  90 },
];

// ─── GaugeCard ────────────────────────────────────────────────────────────────

export function GaugeCard({
  title,
  ariaLabel,
  value1, color1,
  value2, color2,
  legendTitle,
  legend1Label,
  legend2Label,
  statementLabel,
  statementText,
}: {
  title: string;
  ariaLabel: string;
  value1: number | null; color1: string;
  value2: number | null; color2: string;
  legendTitle: string;
  legend1Label: string;
  legend2Label: string;
  statementLabel: string;
  statementText: string;
}) {
  const toAngle = (pct: number) => -90 + (Math.min(pct, 40) / 40) * 180;
  const v1 = value1 ?? 0;
  const v2 = value2 ?? 0;
  const angle1 = toAngle(v1);
  const angle2 = toAngle(v2);
  const sector1 = gaugeSectorPath(102, 90, angle1);
  const sector2 = gaugeSectorPath(84,  72, angle2);
  const passed  = v1 > v2;
  const uid     = ariaLabel.replace(/\s+/g, '-').toLowerCase();

  return (
    // DESIGN CHANGE — GaugeCard with analysis-card elevation and refined header
    <section className="analysis-card overflow-hidden flex-1">
      <div className="px-6 pt-5 pb-4">
        <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
          {title}
        </h3>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-4">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <div className="w-[280px]">
            <svg width="100%" height="210" viewBox="0 0 300 158" role="document" aria-label={ariaLabel} style={{ display: 'block' }}>
              <defs>
                <path id={`${uid}-pin-lg`} d="M2.91895 2.99891C2.96406 1.32971 4.33019 0 6 0C7.66981 0 9.03594 1.32971 9.08105 2.9989L11.8379 105.002C11.9267 108.288 9.28716 111 6 111C2.71284 111 0.0732933 108.288 0.162103 105.002L2.91895 2.99891Z" />
                <path id={`${uid}-pin-md`} d="M2.43209 2.49908C2.46989 1.10803 3.60844 0 5 0C6.39156 0 7.53011 1.10803 7.56791 2.49908L9.86418 87.0018C9.93859 89.74 7.73918 92 5 92C2.26082 92 0.0614128 89.74 0.135819 87.0018L2.43209 2.49908Z" />
              </defs>
              <g transform="translate(150 150)">
                <path d="M0,-120A120,120,0,0,0,-97.082,70.534L-87.374,63.481A108,108,0,0,1,0,-108Z" fill="hsl(0,77%,58%)" fillOpacity="0.5" />
                <path d="M0,-120A120,120,0,0,1,97.082,70.534L87.374,63.481A108,108,0,0,0,0,-108Z" fill="hsl(151,63%,48%)" fillOpacity="0.5" />
                {GAUGE_SEGMENT_PATHS.map((d, i) => <path key={i} d={d} fill={gaugeSegmentColor(i)} />)}
                <path d={sector1} fill={color1} fillOpacity="0.12" />
                <path d={sector2} fill={color2} fillOpacity="0.12" />
                <circle cx="0" cy="0" r="12" fill="#d1d5db" fillOpacity="0.35" />
                <g transform={`translate(-6,-104.5) rotate(${angle1.toFixed(3)}, 6, 104.5)`}>
                  <use href={`#${uid}-pin-lg`} fill={color1} />
                </g>
                <g transform={`translate(-5,-86.5) rotate(${angle2.toFixed(3)}, 5, 86.5)`}>
                  <use href={`#${uid}-pin-md`} fill={color2} />
                </g>
                {GAUGE_AXIS_TICKS.map(({ label, angleDeg }) => {
                  const lp = gaugePolar(angleDeg, 136);
                  const to = gaugePolar(angleDeg, 120);
                  const ti = gaugePolar(angleDeg, 106);
                  return (
                    <g key={angleDeg}>
                      <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill="#9ca3af" fontFamily="Inter, sans-serif">{label}</text>
                      <line x1={to.x} y1={to.y} x2={ti.x} y2={ti.y} stroke="#d1d5db" strokeWidth="1.5" strokeOpacity="0.8" />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Legend */}
          <div className="-mt-4 w-[160px]">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr>
                  <th colSpan={2} className="pb-1.5 text-left font-semibold text-muted-foreground text-[11px] whitespace-nowrap">{legendTitle}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pr-6 py-0.5 text-[11px]" style={{ color: color1 }}>{legend1Label}</td>
                  <td className="font-semibold text-foreground text-[11px]">{safeNbr(value1)}%</td>
                </tr>
                <tr>
                  <td className="pr-6 py-0.5 text-[11px]" style={{ color: color2 }}>{legend2Label}</td>
                  <td className="font-semibold text-foreground text-[11px]">{safeNbr(value2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* DESIGN CHANGE — Statement with refined border and background */}
        <blockquote className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-4">
          <div
            className="rounded-full flex-shrink-0 mt-1.5"
            style={{ width: 8, height: 8, backgroundColor: passed ? '#2EAA8A' : '#D1D5DB' }}
          />
          <p className="text-sm text-dim leading-6 break-words">
            <span className="font-semibold text-foreground">{statementLabel} </span>
            {statementText}
          </p>
        </blockquote>
      </div>
    </section>
  );
}

// ─── GrowthBarChart ───────────────────────────────────────────────────────────

export const AGFC_H = 250;
export const AGFC_MAX_BAR = 218;
export const AGFC_TOP_PAD = 32;

export function GrowthBarChart({ title, bars }: {
  title: string;
  bars: { label: string; value: number; color: string; textColor: string }[];
}) {
  const maxVal = Math.max(...bars.map(b => b.value), 0.01);
  const n = bars.length;
  const pct = 100 / n;
  return (
    <div className="flex-1">
      <div className="relative" style={{ height: AGFC_H }}>
        <svg width="100%" height={AGFC_H} shapeRendering="crispEdges" style={{ position: 'absolute', top: 0, left: 0 }}>
          <rect x="0" y={AGFC_H - 1} width="100%" height="1" fill="#e5e7eb" />
        </svg>
        <svg
          width="100%"
          height={AGFC_H}
          shapeRendering="crispEdges"
          role="document"
          aria-label={title}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {bars.map((bar, i) => {
            const barH = (bar.value / maxVal) * AGFC_MAX_BAR;
            const ty = AGFC_H - barH;
            return (
              <svg key={bar.label} x={`${i * pct}%`} y="0" width={`${pct}%`} height={AGFC_H}>
                <g transform={`translate(0,${ty})`}>
                  <rect x="0" y="0" width="100%" height={barH} fill={bar.color} />
                  <rect x="0" y={barH - 1} width="100%" height="1" fill="#e5e7eb" />
                  <rect x="0" y={-AGFC_TOP_PAD} width="100%" height={AGFC_TOP_PAD} fill="transparent" tabIndex={0} />
                  <svg x="8" y="8" overflow="visible">
                    <text y="0" fill={bar.textColor} fontSize="12" textAnchor="start"
                      aria-label={bar.label} data-cy-id={`bar-chart-title-${bar.label}`}>
                      <tspan x="0" dy="0.71em">{bar.label}</tspan>
                    </text>
                  </svg>
                  <svg x="8" y="-8" overflow="visible">
                    <text y="0" fill="#374151" fontSize="12" textAnchor="start"
                      aria-label={`${bar.value}%`} data-cy-id={`bar-chart-value-${bar.label}`}>
                      <tspan x="0" dy="0em">{bar.value}%</tspan>
                    </text>
                  </svg>
                </g>
              </svg>
            );
          })}
        </svg>
      </div>
      <h4 className="text-xs font-medium text-muted-foreground mt-2 text-center">{title}</h4>
    </div>
  );
}

// ─── SWSDonut ─────────────────────────────────────────────────────────────────

export function SWSDonut({
  value, total, sliceColor, centerLabel, centerValue,
  sliceLabel, sliceDisplayValue, size = 180,
}: {
  value: number; total: number; sliceColor: string;
  centerLabel: string; centerValue: string;
  sliceLabel?: string; sliceDisplayValue?: string; size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 200;
  const r  = 74 * scale;
  const sw = 36 * scale;
  const outerR = 92 * scale;

  const circumference = 2 * Math.PI * r;
  const pct  = Math.min(Math.max(value / total, 0), 1);
  const dash = pct * circumference;

  const midAngleDeg = -90 + (pct * 360) / 2;
  const midAngleRad = (midAngleDeg * Math.PI) / 180;
  const lineLen = 28 * scale;
  const lx1 = cx + outerR * Math.cos(midAngleRad);
  const ly1 = cy + outerR * Math.sin(midAngleRad);
  const lx2 = cx + (outerR + lineLen) * Math.cos(midAngleRad);
  const ly2 = cy + (outerR + lineLen) * Math.sin(midAngleRad);
  const isRight = lx2 >= cx;
  const textX = lx2 + (isRight ? 6 : -6);
  const anchor = isRight ? 'start' : 'end';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3E4855" strokeWidth={sw} />
      {pct > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={sliceColor}
          strokeWidth={sw}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {pct > 0 && sliceLabel && (
        <>
          <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={sliceColor} strokeWidth={1} />
          <circle cx={lx2} cy={ly2} r={2.5 * scale} fill={sliceColor} />
          <text x={textX} y={ly2 - 8 * scale} textAnchor={anchor}
            fontSize={16 * scale} fontWeight="600" fill="#94a3b8" fontFamily="Inter,sans-serif">
            {sliceLabel}
          </text>
          <text x={textX} y={ly2 + 10 * scale} textAnchor={anchor}
            fontSize={13 * scale} fill="#475569" fontFamily="Inter,sans-serif">
            {sliceDisplayValue}
          </text>
        </>
      )}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize={10 * scale + 2} fill="#94a3b8" fontFamily="Inter,sans-serif">
        {centerLabel}
      </text>
      <text x={cx} y={cy + 13 * scale} textAnchor="middle" fontSize={12 * scale + 1} fontWeight="600" fill="#1e293b" fontFamily="Inter,sans-serif">
        {centerValue}
      </text>
    </svg>
  );
}
