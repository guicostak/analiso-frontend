"use client";

/**
 * CustomizeLayoutDrawer
 *
 * Drawer lateral (direita) onde o usuário:
 *   - Reordena as ilhas via drag vertical (Reorder.Group da motion/react)
 *   - Alterna visibilidade de cada ilha (ícone de olho)
 *   - Escolhe um template pré-fabricado como ponto de partida
 *   - Restaura o layout padrão de fábrica
 *
 * A mágica visual acontece em conjunto com o ComparePage: as ilhas lá atrás
 * têm `layoutId` na motion.div, então qualquer mudança feita aqui se reflete
 * em tempo real com animação spring de layout. Não há "aplicar" — o drawer
 * é live.
 */

import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "motion/react";
import { Eye, EyeOff, GripVertical, RotateCcw, Sparkles, X } from "lucide-react";
import type { CompareIslandId } from "../layout/types";
import { getIslandMeta } from "../layout/islandRegistry";
import { COMPARE_TEMPLATES, TEMPLATE_ORDER } from "../layout/templates";
import type { UseCompareLayoutReturn } from "../hooks/useCompareLayout";

interface CustomizeLayoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  layout: UseCompareLayoutReturn;
}

export function CustomizeLayoutDrawer({
  isOpen,
  onClose,
  layout,
}: CustomizeLayoutDrawerProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.button
            onClick={onClose}
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Fechar"
          />

          {/* Drawer */}
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-border bg-card shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Personalizar tela
                </p>
                <h3 className="mt-1 text-[17px] font-semibold text-foreground">
                  Monte sua análise
                </h3>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Arraste pra reordenar, clique no olho pra esconder
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-hover hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Templates */}
            <div className="border-b border-border px-6 py-4">
              <div className="mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Começar de um template
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_ORDER.map((tid) => {
                  const template = COMPARE_TEMPLATES[tid];
                  if (!template) return null;
                  const isActive = layout.templateId === tid;
                  return (
                    <button
                      key={tid}
                      onClick={() => layout.applyTemplate(template)}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                        isActive
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border bg-card text-muted-foreground hover:border-brand hover:text-foreground"
                      }`}
                      title={template.description}
                    >
                      {template.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de ilhas — Reorder.Group */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <Reorder.Group
                axis="y"
                values={[...layout.order]}
                onReorder={(next) =>
                  layout.setOrder(next as CompareIslandId[])
                }
                className="space-y-1.5"
              >
                {layout.order.map((id) => {
                  const meta = getIslandMeta(id);
                  const isHidden = layout.hiddenSet.has(id);
                  return (
                    <Reorder.Item
                      key={id}
                      value={id}
                      className={`group flex items-center gap-3 rounded-[14px] border border-border bg-card px-3 py-2.5 transition ${
                        isHidden ? "opacity-50" : "opacity-100"
                      }`}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0 12px 28px rgba(15,23,40,0.18)",
                        cursor: "grabbing",
                      }}
                    >
                      {/* Drag handle */}
                      <div
                        className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground transition group-hover:text-foreground active:cursor-grabbing"
                        aria-hidden
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {/* Label */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {meta.label}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {meta.hint}
                        </p>
                      </div>

                      {/* Visibility toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          layout.toggleHidden(id);
                        }}
                        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-hover hover:text-foreground"
                        aria-label={isHidden ? "Mostrar" : "Esconder"}
                      >
                        {isHidden ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4">
              {confirmingReset ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] text-muted-foreground">
                    Voltar ao padrão?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmingReset(false)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        layout.reset();
                        setConfirmingReset(false);
                      }}
                      className="rounded-full border border-brand bg-brand/10 px-3 py-1.5 text-[12px] font-medium text-brand transition hover:bg-brand/20"
                    >
                      Restaurar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingReset(true)}
                  disabled={!layout.isCustomized}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-brand hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restaurar padrão
                </button>
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
