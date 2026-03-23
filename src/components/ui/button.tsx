import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // ── Padrões shadcn ──────────────────────────────────────────────
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-hover hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",

        // ── Dashboard / produto ─────────────────────────────────────────
        /** Ação primária com cor mint (ex.: "Ver detalhes", "Comparar") */
        mint:
          "bg-mint-500 text-white hover:bg-mint-600",
        /** Superfície de destaque com tokens de marca (ex.: "Ver evidência") */
        brand:
          "border border-brand-border bg-brand-surface text-brand-text hover:text-foreground",
        /** Botão de texto estilo link com cor mint (ex.: "Ver linha do tempo") */
        "link-mint":
          "text-mint-700 hover:text-mint-800 underline-offset-4 p-0 h-auto",

        // ── Botões de menu / dropdown ───────────────────────────────────
        /** Item padrão de dropdown — largura total, alinhado à esquerda */
        "menu-item":
          "w-full justify-start rounded-lg text-[13px] text-foreground hover:bg-hover",
        /** Item destrutivo de dropdown (ex.: "Sair", "Remover") */
        "menu-item-destructive":
          "w-full justify-start rounded-lg text-[13px] text-rose-600 hover:bg-hover",

        // ── Ações destrutivas inline ────────────────────────────────────
        /** Texto vermelho sem fundo — hover sutil (ex.: "Remover da watchlist") */
        "ghost-destructive":
          "text-rose-600 hover:bg-hover",
      },

      size: {
        default:     "h-9 px-4 py-2 has-[>svg]:px-3",
        sm:          "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        /** Botões de ação compactos dentro de listas/cards */
        xs:          "rounded-md px-2.5 py-1.5 text-xs gap-1",
        lg:          "h-10 rounded-md px-6 has-[>svg]:px-4",
        /** Ícone quadrado padrão (36 × 36) */
        icon:        "size-9",
        /** Ícone quadrado pequeno (28 × 28) */
        "icon-sm":   "size-7",
        /** Ícone redondo (32 × 32) — usado na topbar */
        "icon-round": "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
