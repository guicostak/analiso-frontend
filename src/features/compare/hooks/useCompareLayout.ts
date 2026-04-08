"use client";

/**
 * useCompareLayout
 *
 * Gerencia a customização da tela de Comparação (Fase 1 + Fase 3):
 *
 *   Fase 1 (manual): o usuário reordena ilhas via drag, esconde/mostra via
 *   toggle, e o estado persiste em localStorage entre sessões.
 *
 *   Fase 3 (Luiz): o assistente aplica templates pré-fabricados ou templates
 *   dinâmicos via comando — os mesmos setters internos são usados, então
 *   qualquer caminho (drawer manual ou comando remoto) atualiza o mesmo estado.
 *
 * Persistência:
 *   - Chave: "analiso:compare-layout:v1"
 *   - Versionada: `version: 1` no payload, com migração trivial para futuros bumps
 *   - Tolerante a schema drift: IDs desconhecidos são descartados na leitura,
 *     IDs novos (ilhas adicionadas em versões futuras) aparecem no final
 *     automaticamente — o usuário nunca perde acesso a uma ilha nova.
 *
 * Sincronização entre abas:
 *   - Escuta `storage` events do window para que se o usuário mexer o layout
 *     em outra aba, a aba atual reage. Importante em power users que abrem
 *     várias comparações em paralelo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { CompareIslandId, CompareLayoutState, CompareTemplate } from "../layout/types";
import {
  DEFAULT_ISLAND_ORDER,
  KNOWN_ISLAND_IDS,
  isKnownIslandId,
} from "../layout/islandRegistry";

// ─── Constantes ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "analiso:compare-layout:v1";
const CURRENT_VERSION = 1 as const;

// ─── Default factory ─────────────────────────────────────────────────────────

function createDefaultLayout(): CompareLayoutState {
  return {
    version: CURRENT_VERSION,
    order: [...DEFAULT_ISLAND_ORDER],
    hidden: [],
    templateId: "default",
  };
}

// ─── Persistência ────────────────────────────────────────────────────────────

/**
 * Lê o layout do localStorage, valida, migra e completa com ilhas novas.
 *
 * Qualquer falha de parse, quota ou schema retorna o default. Qualquer ID
 * válido do registry que não esteja em `order` é anexado ao final — assim,
 * quando uma nova ilha for adicionada no código, ela aparece automaticamente
 * para usuários com layout salvo antigo, sem exigir migração manual.
 */
function loadLayoutFromStorage(): CompareLayoutState {
  if (typeof window === "undefined") return createDefaultLayout();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultLayout();

    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return createDefaultLayout();

    const obj = parsed as Record<string, unknown>;
    const version = typeof obj.version === "number" ? obj.version : 0;

    // Futuro: quando `CURRENT_VERSION` for > 1, aplicar migrações aqui.
    if (version !== CURRENT_VERSION) return createDefaultLayout();

    const rawOrder = Array.isArray(obj.order) ? obj.order : [];
    const rawHidden = Array.isArray(obj.hidden) ? obj.hidden : [];
    const rawTemplate = typeof obj.templateId === "string" ? obj.templateId : null;

    // Filtra IDs desconhecidos e duplicatas
    const seen = new Set<CompareIslandId>();
    const order: CompareIslandId[] = [];
    for (const item of rawOrder) {
      if (typeof item !== "string") continue;
      if (!isKnownIslandId(item)) continue;
      if (seen.has(item)) continue;
      seen.add(item);
      order.push(item);
    }

    // Completa com ilhas novas do registry que não estavam salvas
    for (const id of DEFAULT_ISLAND_ORDER) {
      if (!seen.has(id)) order.push(id);
    }

    const hiddenSeen = new Set<CompareIslandId>();
    const hidden: CompareIslandId[] = [];
    for (const item of rawHidden) {
      if (typeof item !== "string") continue;
      if (!isKnownIslandId(item)) continue;
      if (hiddenSeen.has(item)) continue;
      hiddenSeen.add(item);
      hidden.push(item);
    }

    return {
      version: CURRENT_VERSION,
      order,
      hidden,
      templateId: rawTemplate,
    };
  } catch {
    return createDefaultLayout();
  }
}

function saveLayoutToStorage(state: CompareLayoutState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota cheia ou modo privado — falha silenciosa; layout vira in-memory.
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Materializa um template como `CompareLayoutState`:
 *  - `order` = ilhas visíveis do template + restantes do registry no final
 *              (preservando acesso a todas as ilhas via toggle)
 *  - `hidden` = todas as ilhas do registry que NÃO estão em `visibleOrder`
 */
function templateToState(template: CompareTemplate): CompareLayoutState {
  const visibleSet = new Set(template.visibleOrder);
  const order: CompareIslandId[] = [...template.visibleOrder];
  const hidden: CompareIslandId[] = [];

  for (const id of DEFAULT_ISLAND_ORDER) {
    if (!visibleSet.has(id)) {
      order.push(id);
      hidden.push(id);
    }
  }

  return {
    version: CURRENT_VERSION,
    order,
    hidden,
    templateId: template.id,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseCompareLayoutReturn {
  /** Ordem atual das ilhas (incluindo as ocultas, que aparecem no drawer). */
  order: readonly CompareIslandId[];
  /** Ilhas que estão visíveis, na ordem correta. */
  visibleOrder: readonly CompareIslandId[];
  /** Set de IDs ocultos (rápido para `has()`). */
  hiddenSet: ReadonlySet<CompareIslandId>;
  /** Nome do template atualmente aplicado (ou `null` se custom). */
  templateId: string | null;
  /** Indica se o usuário fez alguma customização sobre o default. */
  isCustomized: boolean;

  /** Reordena completamente a lista (usado pelo Reorder.Group do drawer). */
  setOrder: (next: CompareIslandId[]) => void;
  /** Alterna visibilidade de uma ilha. */
  toggleHidden: (id: CompareIslandId) => void;
  /** Esconde uma ilha específica. */
  hideIsland: (id: CompareIslandId) => void;
  /** Mostra uma ilha específica. */
  showIsland: (id: CompareIslandId) => void;
  /** Aplica um template pré-fabricado ou dinâmico. */
  applyTemplate: (template: CompareTemplate) => void;
  /** Restaura o layout padrão de fábrica. */
  reset: () => void;
}

export function useCompareLayout(): UseCompareLayoutReturn {
  // SSR-safe: começa no default e hidrata no primeiro effect
  const [state, setState] = useState<CompareLayoutState>(() => createDefaultLayout());
  const hydratedRef = useRef(false);

  // ── Hidratação a partir do localStorage no client ─────────────────────────
  useEffect(() => {
    const loaded = loadLayoutFromStorage();
    setState(loaded);
    hydratedRef.current = true;
  }, []);

  // ── Persiste a cada mudança (após hidratação) ─────────────────────────────
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveLayoutToStorage(state);
  }, [state]);

  // ── Sincroniza com outras abas ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setState(loadLayoutFromStorage());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const setOrder = useCallback((next: CompareIslandId[]) => {
    setState((prev) => {
      // Sanitize: mantém só IDs conhecidos e sem duplicatas, completa com
      // o que faltar no final (defesa contra chamadas malformadas).
      const seen = new Set<CompareIslandId>();
      const clean: CompareIslandId[] = [];
      for (const id of next) {
        if (!KNOWN_ISLAND_IDS.has(id)) continue;
        if (seen.has(id)) continue;
        seen.add(id);
        clean.push(id);
      }
      for (const id of DEFAULT_ISLAND_ORDER) {
        if (!seen.has(id)) clean.push(id);
      }
      return { ...prev, order: clean, templateId: null };
    });
  }, []);

  const toggleHidden = useCallback((id: CompareIslandId) => {
    setState((prev) => {
      const isHidden = prev.hidden.includes(id);
      const hidden = isHidden
        ? prev.hidden.filter((h) => h !== id)
        : [...prev.hidden, id];
      return { ...prev, hidden, templateId: null };
    });
  }, []);

  const hideIsland = useCallback((id: CompareIslandId) => {
    setState((prev) => {
      if (prev.hidden.includes(id)) return prev;
      return { ...prev, hidden: [...prev.hidden, id], templateId: null };
    });
  }, []);

  const showIsland = useCallback((id: CompareIslandId) => {
    setState((prev) => {
      if (!prev.hidden.includes(id)) return prev;
      return {
        ...prev,
        hidden: prev.hidden.filter((h) => h !== id),
        templateId: null,
      };
    });
  }, []);

  const applyTemplate = useCallback((template: CompareTemplate) => {
    setState(templateToState(template));
  }, []);

  const reset = useCallback(() => {
    setState(createDefaultLayout());
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const hiddenSet = new Set(state.hidden);
  const visibleOrder = state.order.filter((id) => !hiddenSet.has(id));

  const isCustomized =
    state.hidden.length > 0 ||
    state.order.some((id, i) => id !== DEFAULT_ISLAND_ORDER[i]);

  return {
    order: state.order,
    visibleOrder,
    hiddenSet,
    templateId: state.templateId,
    isCustomized,
    setOrder,
    toggleHidden,
    hideIsland,
    showIsland,
    applyTemplate,
    reset,
  };
}
