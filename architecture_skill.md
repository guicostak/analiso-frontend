# Prompt — Refatoração Frontend: Next.js + TypeScript + Design System

> Copie e cole este prompt direto no Claude Code para iniciar a refatoração.

---

## Identidade e escopo

Você é um engenheiro frontend sênior especialista em Next.js (App Router), TypeScript e design systems escaláveis.

Sua tarefa é refatorar este projeto aplicando arquitetura limpa, padronização visual rigorosa e reutilização máxima de componentes e tokens.

O projeto usa **Next.js + App Router**, **TypeScript**, **Tailwind CSS v4**, **Shadcn/ui** e **Tremor**.

---

## Regras absolutas — nunca violar

1. **ZERO valores hardcoded** de cor, espaçamento ou tipografia — sempre variáveis CSS ou tokens Tailwind semânticos
2. **ZERO lógica de negócio em componentes** — toda lógica vai para hooks (`use<Feature><Action>`)
3. **ZERO chamadas HTTP em componentes** — toda comunicação via `services/`
4. **ZERO uso de `any`** no TypeScript — sempre tipar explicitamente
5. **ZERO quebra de build** — após cada alteração: `npm run build` deve passar sem erros
6. **ZERO cores fixas no dark mode** — toda cor deve inverter automaticamente via CSS variable

---

## Estrutura de pastas obrigatória

```
src/
  app/                        # Páginas finas — apenas composição + hooks
  components/
    ui/                       # Design system puro (Button, Input, Card, Badge, Modal)
    layout/                   # Header, Sidebar, Footer
    shared/                   # Componentes com contexto leve (UserCard, ProductCard)
    feedback/                 # Loading, Skeleton, ErrorState, EmptyState
    forms/                    # FormField, ControlledInput, Select
  features/
    <feature-name>/
      components/             # Componentes exclusivos da feature
      hooks/                  # use<Feature><Action>.ts
      services/               # Chamadas HTTP isoladas
      interfaces/             # DTO (API) separado de Model (UI)
      mappers/                # Transforma DTO → Model
      utils/                  # Helpers específicos da feature
  hooks/                      # Hooks globais reutilizáveis
  services/                   # Services globais
  interfaces/                 # Tipos globais compartilhados
  mappers/                    # Mappers globais
  lib/                        # Configurações (axios, zod, etc.)
  constants/                  # Constantes globais tipadas
  styles/
    globals.css               # Tokens CSS + resets (ver seção abaixo)
    themes.css                # Documentação dos tokens (ver seção abaixo)
```

### Estrutura de cada componente

```
ComponentName/
  ComponentName.tsx           # Apenas JSX presentacional
  ComponentName.types.ts      # Props e variantes tipadas
  ComponentName.styles.ts     # Variantes com cva() se usar class-variance-authority
  index.ts                    # Re-export público
```

---

## Tokens CSS — globals.css

> Este é o arquivo real do projeto. Nunca substituir por valores próprios — sempre referenciar estas variáveis.

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");
@import "tailwindcss";
@source "../../node_modules/@tremor/react/**/*.{js,mjs}";

@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 15px;
  --font-sans: "Inter", BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --radius: 0.625rem;

  /* ── Superfícies ─────────────────────────────────────────────────────── */
  --background: #F8FAFC;   /* página principal                              */
  --card:       #ffffff;   /* cards, painéis de primeiro nível              */
  --popover:    #ffffff;   /* popovers, dropdowns                           */
  --muted:      #F1F5F9;   /* painéis secundários, áreas neutras            */
  --accent:     #F1F5F9;   /* hover dentro de cards                         */

  /* ── Texto ───────────────────────────────────────────────────────────── */
  --foreground:         #0F172A;   /* texto primário (headings, valores)    */
  --card-foreground:    #0F172A;
  --popover-foreground: #0F172A;
  --muted-foreground:   #64748B;   /* texto secundário, labels, metadata    */
  --accent-foreground:  #0F172A;
  --dim:                #475569;   /* texto levemente acima do muted        */

  /* ── Bordas ──────────────────────────────────────────────────────────── */
  --border:        #E2E8F0;   /* borda padrão                              */
  --border-strong: #CBD5E1;   /* borda pronunciada (separadores, focus)    */
  --input:         #E2E8F0;
  --ring:          #0E9384;

  /* ── Interação ───────────────────────────────────────────────────────── */
  --hover: #F1F5F9;

  /* ── Marca / Brand (Mint–Teal) ───────────────────────────────────────── */
  --brand:         #0E9384;
  --brand-hover:   #0B7A6E;
  --brand-surface: #F0FDFA;
  --brand-border:  #99F6E0;
  --brand-text:    #0F766E;

  /* ── Status / Semáforo ───────────────────────────────────────────────── */
  --success-surface: #ECFDF5;
  --success-border:  #A7F3D0;
  --success-text:    #16A34A;

  --warning-surface: #FFFBEB;
  --warning-border:  #FDE68A;
  --warning-text:    #D97706;

  --danger-surface:  #FEF2F2;
  --danger-border:   #FECACA;
  --danger-text:     #DC2626;

  /* ── Utilitários ─────────────────────────────────────────────────────── */
  --gold:         #FBBF24;
  --notification: #DC2626;

  /* ── Primary / Secondary / Destructive (Shadcn) ─────────────────────── */
  --primary:              #0F172A;
  --primary-foreground:   #ffffff;
  --secondary:            #F1F5F9;
  --secondary-foreground: #0F172A;
  --destructive:          #DC2626;
  --destructive-foreground: #ffffff;

  /* ── Formulários ─────────────────────────────────────────────────────── */
  --input-background:  #f3f3f5;
  --switch-background: #cbced4;

  /* ── Sidebar ─────────────────────────────────────────────────────────── */
  --sidebar:                    #ffffff;
  --sidebar-foreground:         #0F172A;
  --sidebar-primary:            #0F172A;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent:             #F1F5F9;
  --sidebar-accent-foreground:  #0F172A;
  --sidebar-border:             #E2E8F0;
  --sidebar-ring:               #0E9384;

  /* ── Paleta Mint (escala completa) ───────────────────────────────────── */
  --mint-50:  #f0fdf9;
  --mint-100: #ccfbef;
  --mint-200: #99f6e0;
  --mint-300: #5eead4;
  --mint-400: #2dd4bf;
  --mint-500: #14b8a6;
  --mint-600: #0d9488;
  --mint-700: #0f766e;
}

.dark {
  /* ── Superfícies ─────────────────────────────────────────────────────── */
  --background: #020617;   /* navy profundo                                 */
  --card:       #0B1220;   /* azul-carvão                                   */
  --popover:    #0B1220;
  --muted:      #0F172A;
  --accent:     #0F172A;

  /* ── Texto ───────────────────────────────────────────────────────────── */
  --foreground:         #E5E7EB;
  --card-foreground:    #E5E7EB;
  --popover-foreground: #E5E7EB;
  --muted-foreground:   #94A3B8;
  --accent-foreground:  #E5E7EB;
  --dim:                #CBD5E1;

  /* ── Bordas ──────────────────────────────────────────────────────────── */
  --border:        #1F2937;
  --border-strong: #334155;
  --input:         #1F2937;
  --ring:          #0E9384;

  /* ── Interação ───────────────────────────────────────────────────────── */
  --hover: #1F2937;

  /* ── Marca / Brand ───────────────────────────────────────────────────── */
  --brand:         #0E9384;
  --brand-hover:   #168E7D;
  --brand-surface: #0F2B2A;
  --brand-border:  #134E48;
  --brand-text:    #5EEAD4;   /* mint claro para contraste no escuro        */

  /* ── Status / Semáforo ───────────────────────────────────────────────── */
  --success-surface: #022c22;
  --success-border:  #065F46;
  --success-text:    #34d399;

  --warning-surface: #1C1500;
  --warning-border:  #92400E;
  --warning-text:    #FBBF24;

  --danger-surface:  #200000;
  --danger-border:   #7F1D1D;
  --danger-text:     #EF4444;

  /* ── Utilitários ─────────────────────────────────────────────────────── */
  --gold:         #FBBF24;
  --notification: #EF4444;

  /* ── Primary / Secondary / Destructive (Shadcn) ─────────────────────── */
  --primary:              #E5E7EB;
  --primary-foreground:   #0B1220;
  --secondary:            #0F172A;
  --secondary-foreground: #E5E7EB;
  --destructive:          #EF4444;
  --destructive-foreground: #ffffff;

  /* ── Sidebar ─────────────────────────────────────────────────────────── */
  --sidebar:                    #0B1220;
  --sidebar-foreground:         #E5E7EB;
  --sidebar-primary:            #0E9384;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent:             #0F172A;
  --sidebar-accent-foreground:  #E5E7EB;
  --sidebar-border:             #1F2937;
  --sidebar-ring:               #0E9384;
}
```

---

## Referência rápida de tokens Tailwind

> Use sempre estas classes. Nunca usar `text-[#hex]`, `bg-[#hex]` ou similares hardcoded.

### Superfícies
| Classe Tailwind       | Token CSS        | Uso                                  |
|-----------------------|------------------|--------------------------------------|
| `bg-background`       | `--background`   | Fundo da página                      |
| `bg-card`             | `--card`         | Cards, painéis de primeiro nível     |
| `bg-muted`            | `--muted`        | Painéis secundários, áreas neutras   |
| `bg-accent`           | `--accent`       | Hover dentro de cards                |
| `bg-hover`            | `--hover`        | Hover em linhas de tabela / botões   |
| `bg-brand-surface`    | `--brand-surface`| Fundo com toque da marca             |

### Texto
| Classe Tailwind         | Token CSS             | Uso                            |
|-------------------------|-----------------------|--------------------------------|
| `text-foreground`       | `--foreground`        | Texto primário, headings       |
| `text-muted-foreground` | `--muted-foreground`  | Labels, metadata, texto leve   |
| `text-dim`              | `--dim`               | Texto intermediário            |
| `text-brand`            | `--brand`             | Cor da marca                   |
| `text-brand-text`       | `--brand-text`        | Texto com cor da marca         |

### Bordas
| Classe Tailwind       | Token CSS          | Uso                              |
|-----------------------|--------------------|----------------------------------|
| `border-border`       | `--border`         | Borda padrão                     |
| `border-border-strong`| `--border-strong`  | Borda pronunciada, inputs focus  |
| `border-brand-border` | `--brand-border`   | Borda com toque da marca         |

### Status (semáforo)
| Superfície                 | Borda                      | Texto                      |
|----------------------------|----------------------------|----------------------------|
| `bg-success-surface`       | `border-success-border`    | `text-success-text`        |
| `bg-warning-surface`       | `border-warning-border`    | `text-warning-text`        |
| `bg-danger-surface`        | `border-danger-border`     | `text-danger-text`         |

---

## Padrão de componente ui/ — exemplo Button

```typescript
// Button.types.ts
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?:    ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}
```

```tsx
// Button.tsx — zero lógica de negócio, apenas apresentação
import { ButtonProps } from './Button.types';

const variantMap: Record<ButtonVariant, string> = {
  primary:   'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-card border border-border text-foreground hover:bg-hover',
  ghost:     'bg-transparent text-muted-foreground hover:bg-muted',
  danger:    'bg-danger-surface border border-danger-border text-danger-text',
};

const sizeMap: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-md font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantMap[variant]} ${sizeMap[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
    </button>
  );
}
```

---

## Padrão de hook + service + mapper

```typescript
// features/products/interfaces/product.interfaces.ts

// DTO — formato exato da API, nunca usar diretamente na UI
export interface ProductDTO {
  product_id:   string;
  product_name: string;
  unit_price:   number;
  is_active:    boolean;
}

// Model — formato de UI, derivado do DTO via mapper
export interface Product {
  id:             string;
  name:           string;
  price:          number;
  active:         boolean;
  formattedPrice: string;
}
```

```typescript
// features/products/mappers/product.mapper.ts
import { ProductDTO, Product } from '../interfaces/product.interfaces';

export const mapProduct = (dto: ProductDTO): Product => ({
  id:             dto.product_id,
  name:           dto.product_name,
  price:          dto.unit_price,
  active:         dto.is_active,
  formattedPrice: new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(dto.unit_price),
});
```

```typescript
// features/products/services/product.service.ts
// ZERO lógica de UI aqui — apenas comunicação HTTP
import { ProductDTO } from '../interfaces/product.interfaces';
import { api } from '@/lib/api';

export const productService = {
  getAll: async (): Promise<ProductDTO[]> => {
    const res = await api.get('/products');
    return res.data;
  },
  getById: async (id: string): Promise<ProductDTO> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
};
```

```typescript
// features/products/hooks/useProductList.ts
// Orquestra service + mapper + estado — sem JSX
import { useState, useEffect } from 'react';
import { Product } from '../interfaces/product.interfaces';
import { productService } from '../services/product.service';
import { mapProduct } from '../mappers/product.mapper';

export function useProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    productService
      .getAll()
      .then(dtos => setProducts(dtos.map(mapProduct)))
      .catch(e   => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
```

```tsx
// app/products/page.tsx — página fina: apenas composição + hook
import { useProductList } from '@/features/products/hooks/useProductList';
import { ProductList }    from '@/features/products/components/ProductList';
import { ProductListSkeleton } from '@/components/feedback/Skeleton';
import { ErrorState }     from '@/components/feedback/ErrorState';

export default function ProductsPage() {
  const { products, loading, error } = useProductList();

  if (loading) return <ProductListSkeleton />;
  if (error)   return <ErrorState message={error} />;
  return <ProductList products={products} />;
}
```

---

## Checklist dark mode — ilhas e cards

Para **cada card, banner, painel ou seção isolada**, verificar antes de fazer commit:

```
[ ] bg        → bg-card / bg-muted / bg-brand-surface  (nunca bg-white ou hex)
[ ] border    → border-border / border-brand-border    (nunca border-[#hex])
[ ] texto 1°  → text-foreground                        (nunca text-[#hex])
[ ] texto 2°  → text-muted-foreground / text-dim       (nunca text-[#hex])
[ ] gradiente → sempre com variante dark: explícita
[ ] badge     → tokens semânticos (success/warning/danger)
[ ] sombra    → dark:shadow-none ou dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]
[ ] ícone     → dark: fallback com cor semântica
[ ] skeleton  → bg-muted animate-pulse                 (nunca bg-[#E8F0FB])
```

### Exemplos corretos

```tsx
{/* Card base */}
<div className="bg-card border border-border rounded-lg shadow-sm dark:shadow-none p-6">

{/* Badge de status */}
<span className="border bg-success-surface border-success-border text-success-text px-2 py-0.5 rounded-full text-xs">
  Saudável
</span>

{/* Gradiente com variante dark */}
<div className="bg-[linear-gradient(180deg,#DCEBFF_0%,#EAF3FF_100%)]
                dark:bg-[linear-gradient(180deg,rgba(59,130,246,0.15)_0%,transparent_100%)]">

{/* Skeleton */}
<div className="bg-muted animate-pulse rounded h-4 w-32" />
```

---

## Estratégia de refatoração — passo a passo

Para cada arquivo que mistura estado + UI + fetch, executar **nesta ordem**:

1. Criar interface `DTO` (formato da API) e `Model` (formato UI)
2. Criar mapper `DTO → Model`
3. Extrair chamadas HTTP para `service`
4. Extrair lógica para hook (`use<Feature><Action>`)
5. Componente passa a receber apenas props tipadas do `Model`
6. Substituir toda cor/espaçamento hardcoded por token Tailwind
7. Adicionar variante `dark:` em todos os elementos visuais
8. Executar `npm run build` — corrigir **todos** os erros antes de avançar
9. Verificar checklist dark mode em cada ilha/card refatorado

### Ordem recomendada por impacto

| Prioridade | O que refatorar                        | Motivo                                          |
|------------|----------------------------------------|-------------------------------------------------|
| 1          | `globals.css` + `themes.css`           | Base de tudo — resolver primeiro                |
| 2          | `components/ui/` (Button, Input, Card) | Componentes mais reutilizados                   |
| 3          | `components/layout/`                   | Afeta toda a aplicação                          |
| 4          | Features com mais dependentes          | Maior impacto visual ao corrigir                |
| 5          | Páginas (`app/`)                       | Tornar finas após hooks estarem prontos         |

---

## Regra de dependência entre camadas

```
components/ui/       → sem imports de features/
components/layout/   → sem imports de features/
features/<x>/        → auto-contida, pode ser removida sem afetar outras features
app/                 → importa de features/ e components/ mas não de outros app/
```

> Componentes globais (`ui/`, `layout/`) **nunca** importam de `features/`.
> Se precisar de algo de uma feature em outro lugar, extraia para `components/shared/`.

---

## Critérios de conclusão

A refatoração está concluída quando **todos** os itens abaixo estiverem marcados:

```
[ ] npm run build passa sem nenhum erro ou warning de TypeScript
[ ] Nenhum valor de cor hardcoded (#hex, rgb()) em componentes ou CSS
[ ] Todo componente ui/ tem .types.ts com props explícitas (sem `any`)
[ ] Todo fetch de dados está em um service/, nunca em componente
[ ] Todo estado complexo está em um hook use<Feature><Action>
[ ] Todo DTO tem mapper correspondente antes de chegar à UI
[ ] Dark mode funciona em 100% dos elementos (ilhas, banners, badges, gradientes)
[ ] Componentes globais (ui/, layout/) não importam nada de features/
[ ] Cada feature é auto-contida — pode ser removida sem afetar outras
```
