"use client";

/**
 * IslandFrame
 *
 * Shell de cada ilha no `CanvasGrid`. Responsabilidades:
 *   - registrar a ilha como sortable (`useSortable` do dnd-kit)
 *   - aplicar o tamanho efetivo no grid (`grid-column: span W; grid-row: span H`)
 *   - mostrar drag-handle, botão remover (com confirmação inline amber) e
 *     popover de configuração SOMENTE em modo edição
 *   - desabilitar interações do conteúdo enquanto o usuário arrasta
 *
 * **Visual durante drag:** o item ARRASTADO fica `opacity: 0` (placeholder
 * vazio com ring brand tracejado pra indicar "vai cair aqui"). O clone
 * visível segue o cursor via `<DragOverlay>` em `CanvasGrid` — pattern
 * canônico do dnd-kit pra evitar conflito entre transform por frame e
 * reflow do grid.
 *
 * Os items IRMÃOS continuam com transform + transition do dnd-kit pra
 * shifting suave quando abrem espaço.
 *
 * Loss Aversion: a confirmação de remoção usa amber, nunca red gritante.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { Check, GripVertical, Settings2, Trash2 } from "lucide-react";

import { cn } from "@/src/components/ui/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";

import { useEditMode } from "../hooks/useEditMode";
import { resolveIslandSize, type IslandRegistryEntry } from "../registry/IslandRegistry";
import type { LayoutItem } from "../interfaces/layout.types";
import type { IslandConfig, IslandSize } from "../interfaces/island.types";

export interface IslandFrameProps {
  item: LayoutItem;
  entry: IslandRegistryEntry;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, config: IslandConfig) => void;
  /** True se a ilha está marcada na seleção múltipla. */
  isSelected: boolean;
  /** Toggle de seleção (controlado pelo CanvasGrid). */
  onToggleSelection: (id: string) => void;
  /**
   * Tamanho efetivo a usar no grid (sobrescreve `baseSize`/`computeSize`
   * quando informado). Vem do packer no view mode — items growable podem
   * ter `w` maior que o `baseSize` pra preencher gaps de linha.
   */
  displayedSize?: IslandSize;
}

export function IslandFrame({
  item,
  entry,
  onRemove,
  onConfigChange,
  isSelected,
  onToggleSelection,
  displayedSize,
}: IslandFrameProps) {
  const { isEditing } = useEditMode();

  // `displayedSize` (vindo do packer no view mode) sobrescreve quando
  // presente. Em edit mode, sempre usa o `baseSize` puro (item arranca
  // do tamanho original pra UX previsível durante o DnD).
  const size = displayedSize ?? resolveIslandSize(entry, item.config);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditing });

  // Style do wrapper:
  //   - transform/transition aplicam pra ANIMAR irmãos quando abrem espaço.
  //   - Pro item ATIVO (isDragging), o transform fica neutro: o clone visual
  //     vive no DragOverlay, então não queremos a ilha original ALSO seguir
  //     o cursor (o que daria efeito duplo). Mantemos só `opacity: 0` pra
  //     virar placeholder sem conteúdo.
  //   - `transition: undefined` no item ativo evita lag entre frames de
  //     transform — irrelevante aqui já que zeramos o transform, mas defensivo.
  //   - `willChange: transform` hint pro browser usar GPU layer dedicada,
  //     reduz repaint custos em ilhas grandes (feed_mudancas 12×3).
  const style: React.CSSProperties = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    gridColumn: `span ${size.w} / span ${size.w}`,
    gridRow:    `span ${size.h} / span ${size.h}`,
    // `opacity: 0` esconde mas pode deixar subpixel artifacts no Chrome
    // durante transforms vizinhos (irmãos do dnd-kit shiftando). Combinar
    // com `visibility: hidden` mata os artifacts garantidamente.
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? "hidden" : undefined,
    willChange: transform ? "transform" : undefined,
  };

  const Component = entry.component;
  const hasConfig = Boolean(entry.meta.configSchema?.itemCount);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      data-island-id={item.id}
      data-island-kind={item.kind}
      // **Layout animation**: framer-motion mede tamanho/posição antes e
      // depois de cada render e anima a transição via FLIP technique.
      // Ativado APENAS em view mode parado — durante edit (DnD) o
      // dnd-kit tá controlando transforms; durante drag, queremos
      // transforms instantâneos. Sem essa guard, layout=true brigaria
      // com o transform do useSortable e geraria jitter.
      layout={!isEditing && !isDragging}
      // Spring suave — feedback de "items reorganizando" sem ser bouncy.
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className={cn(
        "relative min-w-0",
        // Ring (não outline) — respeita border-radius e não causa shimmer
        // em transform 60fps. Match em rounded-[24px] com o IslandShell.
        isEditing && !isDragging && !isSelected &&
          "rounded-[24px] ring-2 ring-dashed ring-border/70 ring-offset-0",
        // Selecionada na seleção múltipla: ring solid brand + offset suave.
        // Visual mais "sólido" que o dashed neutro — comunica intenção
        // ativa do usuário ("estou pegando essa pra remover/agir").
        isEditing && !isDragging && isSelected &&
          "rounded-[24px] ring-2 ring-brand ring-offset-2 ring-offset-background",
        // Quando arrastada, deixa um placeholder visível (ring solid brand)
        // pra o usuário ver onde a ilha "saiu" e onde vai voltar se cancelar.
        isDragging &&
          "rounded-[24px] ring-2 ring-brand/40 ring-offset-0",
      )}
    >
      <div className={cn("h-full w-full", isEditing && "pointer-events-none select-none")}>
        <Component islandId={item.id} config={item.config} />
      </div>

      {isEditing && (
        // Mini-navbar no canto superior DIREITO de cada ilha. Pill único
        // com 3 (ou 4, se hasConfig) ações color-coded por função:
        //   - Selecionar: BLUE (brand) — informational, "tô pegando isso"
        //   - Mover: PURPLE/INDIGO — neutral but distinct (drag affordance)
        //   - Configurar: GRAY — settings universal (when applicable)
        //   - Remover: RED — destructive (toast undo cobre arrependimento)
        // Cada ação tem cor distinta no rest E no hover pra aumentar
        // recognition (Nielsen #6) sem precisar ler texto.
        <div
          className={cn(
            "absolute right-1.5 top-1.5 z-20",
            "flex items-center gap-0.5",
            // **Bg solid** (não usar `bg-card/95 backdrop-blur-sm`):
            // backdrop-filter recalcula a cada frame quando irmãos shiftam
            // via transform durante drag → distorção visível no conteúdo
            // das ilhas vizinhas que passam atrás da toolbar.
            "rounded-full border border-border/80 bg-card",
            "p-0.5 shadow-[0_4px_12px_-2px_rgba(15,23,40,0.12)]",
          )}
          role="toolbar"
          aria-label={`Ações para ${entry.meta.label}`}
        >
          {/* ── 1. Selecionar — círculo cinza no rest, brand quando ativo ──
              Usar círculo (não quadrado) + cor neutra comunica
              "estado pendente/inativo" sem competir com o brand. Quando
              marcado, o botão inteiro vira brand-filled com check branco
              (mesmo padrão de toggle radio/checkbox modernos). */}
          <button
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            aria-label={isSelected ? "Desmarcar ilha" : "Selecionar ilha"}
            title={isSelected ? "Desmarcar" : "Selecionar pra ações em massa"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection(item.id);
            }}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150",
              isSelected
                ? "bg-brand text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {isSelected ? (
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            ) : (
              <span
                className="h-3.5 w-3.5 rounded-full border-[1.5px] border-current"
                aria-hidden
              />
            )}
          </button>

          {/* divider */}
          <span className="h-4 w-px bg-border/60" aria-hidden />

          {/* ── 2. Mover (INDIGO/PURPLE) ── */}
          <button
            type="button"
            aria-label="Mover ilha (arraste)"
            title="Arraste para reposicionar"
            // touch-none: previne scroll do mobile interferir no drag.
            // cursor-grab → cursor-grabbing dá feedback claro de "arrastável".
            className="
              flex h-7 w-7 cursor-grab touch-none items-center justify-center
              rounded-full text-indigo-600 transition-colors duration-150
              hover:bg-indigo-50 hover:text-indigo-700
              dark:text-indigo-400 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300
              active:cursor-grabbing
            "
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {/* ── 3. Configurar (GRAY) — só quando aplicável ── */}
          {hasConfig && (
            <>
              <span className="h-4 w-px bg-border/60" aria-hidden />
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Configurar ilha"
                    title="Configurar"
                    className="
                      flex h-7 w-7 items-center justify-center
                      rounded-full text-muted-foreground transition-colors duration-150
                      hover:bg-muted hover:text-foreground
                    "
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-56 p-3">
                  {entry.meta.configSchema?.itemCount && (
                    <div className="space-y-2">
                      <p className="text-[12px] font-medium text-muted-foreground">
                        {entry.meta.configSchema.itemCount.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.meta.configSchema.itemCount.options.map((opt) => {
                          const current = item.config.itemCount ?? entry.meta.configSchema?.itemCount?.default;
                          const isOn = current === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => onConfigChange(item.id, { itemCount: opt })}
                              className={cn(
                                "rounded-full px-3 py-1 text-[12px] font-medium transition",
                                isOn ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </>
          )}

          {/* divider */}
          <span className="h-4 w-px bg-border/60" aria-hidden />

          {/* ── 4. Remover (RED) — destructive primary, mais alarmante
              que amber. Toast undo continua cobrindo arrependimento. ── */}
          <button
            type="button"
            aria-label={`Remover ${entry.meta.label}`}
            title={`Remover "${entry.meta.label}"`}
            onClick={() => onRemove(item.id)}
            className="
              flex h-7 w-7 items-center justify-center
              rounded-full text-red-600 transition-colors duration-150
              hover:bg-red-50 hover:text-red-700
              dark:text-red-400 dark:hover:bg-red-950/60 dark:hover:text-red-300
            "
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
