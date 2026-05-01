/**
 * packSection
 *
 * Algoritmo de packing inteligente que estica items "growable" pra
 * preencher gaps numa grid de 12 colunas. Usado no view mode (após
 * "Concluir personalização") pra reduzir buracos visuais.
 *
 * **Estratégia (greedy row-based em 2 passes):**
 *
 * **Pass 1 — Horizontal (w-grow):**
 *   1. Itera items na ordem
 *   2. Tenta encaixar cada item na linha atual; se overflow (cols > 12),
 *      flush a linha e começa uma nova
 *   3. Ao flushar uma linha com gap > 0, distribui o gap entre items
 *      com `growable=["w"]` da linha — começando pelo último (preserva
 *      visual de "primeiros items mantêm tamanho")
 *   4. Cada growable estica até `maxW` ou até o gap acabar
 *
 * **Pass 2 — Vertical (h-grow):**
 *   1. Pra cada row, calcula o `h` máximo dentre seus items
 *   2. Items com `growable=["h"]` esticam até esse máximo (capped por `maxH`)
 *   3. Resultado: items mais baixos crescem pra acompanhar o vizinho mais
 *      alto, fechando "buracos verticais" na grid
 *
 * **Limitações (aceitas):**
 *   - Trata items como flat (h=1) pra fins de COMPUTAR rows. Items com
 *     h>1 bloqueiam cols em rows subsequentes no CSS Grid real, mas nosso
 *     algoritmo não modela isso. Layouts típicos funcionam; edge cases
 *     mistos ficam aproximados.
 *   - V-grow só matcha items na MESMA row lógica. Não resolve gaps
 *     causados por items de h diferente em rows diferentes.
 *
 * Retorna: Map<itemId, IslandSize> com o tamanho EFETIVO. Items sem
 * growConstraints mantêm `baseSize`.
 */

import type { IslandSize } from "../interfaces/island.types";
import type { LayoutItem } from "../interfaces/layout.types";
import { getIsland, resolveIslandSize } from "../registry/IslandRegistry";

const GRID_COLS = 12;

interface PackedItem {
  id: string;
  /** Largura atual (pode crescer no pass 1). */
  w: number;
  /** Altura atual (pode crescer no pass 2). */
  h: number;
  maxW: number;
  maxH: number;
  growableW: boolean;
  growableH: boolean;
}

interface PackedRow {
  items: PackedItem[];
}

export function packSection(
  itemsInOrder: LayoutItem[],
): Map<string, IslandSize> {
  const result = new Map<string, IslandSize>();

  // ── Pass 1: empacotamento horizontal ──────────────────────────────
  const rows: PackedRow[] = [];
  let currentRow: PackedItem[] = [];
  let usedCols = 0;

  const flushRow = () => {
    if (currentRow.length === 0) return;
    let gap = GRID_COLS - usedCols;

    // Distribui o gap horizontal: do último growable pro primeiro.
    if (gap > 0) {
      for (let i = currentRow.length - 1; i >= 0 && gap > 0; i--) {
        const it = currentRow[i];
        if (!it.growableW) continue;
        const room = it.maxW - it.w;
        if (room <= 0) continue;
        const grow = Math.min(room, gap);
        it.w += grow;
        gap -= grow;
      }
    }

    rows.push({ items: currentRow });
    currentRow = [];
    usedCols = 0;
  };

  for (const item of itemsInOrder) {
    const entry = getIsland(item.kind);
    if (!entry) continue;
    const baseSize = resolveIslandSize(entry, item.config);
    const grow = entry.meta.growConstraints;
    const maxW = grow?.maxW ?? baseSize.w;
    const maxH = grow?.maxH ?? baseSize.h;
    const growableW = Boolean(grow?.growable?.includes("w") && maxW > baseSize.w);
    const growableH = Boolean(grow?.growable?.includes("h") && maxH > baseSize.h);

    if (usedCols + baseSize.w > GRID_COLS) {
      flushRow();
    }

    currentRow.push({
      id: item.id,
      w: baseSize.w,
      h: baseSize.h,
      maxW,
      maxH,
      growableW,
      growableH,
    });
    usedCols += baseSize.w;

    if (usedCols === GRID_COLS) {
      flushRow();
    }
  }
  flushRow();

  // ── Pass 2: alinhamento vertical (h-grow) ─────────────────────────
  // Pra cada row, items growableH crescem até a altura máxima da row
  // (capped por maxH). Fecha buracos verticais entre items de h diferente
  // que ficaram na mesma row.
  for (const row of rows) {
    const rowMaxH = row.items.reduce((acc, it) => Math.max(acc, it.h), 0);
    if (rowMaxH <= 1) continue; // row toda h=1, nada a fazer
    for (const it of row.items) {
      if (!it.growableH) continue;
      const target = Math.min(it.maxH, rowMaxH);
      if (target > it.h) {
        it.h = target;
      }
    }
  }

  // ── Materialize resultado ─────────────────────────────────────────
  for (const row of rows) {
    for (const it of row.items) {
      result.set(it.id, { w: it.w, h: it.h });
    }
  }

  return result;
}
