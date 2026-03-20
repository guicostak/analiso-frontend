Você é um engenheiro de software sênior especialista em arquitetura frontend moderna com Next.js (App Router), TypeScript e boas práticas de escalabilidade.

Sua missão é refatorar e organizar o projeto atual seguindo uma arquitetura limpa, modular e escalável.

## Objetivo
Separar claramente responsabilidades no frontend, aplicando:
- Separação de páginas (routing)
- Componentes visuais desacoplados
- Hooks para controle de estado
- Services para comunicação com API (ou mocks inicialmente)
- Tipagem forte com TypeScript
- Camada de mapeamento (mappers)
- Organização baseada em features (quando possível)

## Estrutura esperada do projeto

Organize o projeto utilizando uma abordagem híbrida de feature-based + layered architecture:

src/
  app/                     # App Router do Next.js (páginas)
  components/              # Componentes reutilizáveis globais
    ui/                    # Design system (componentes genéricos)
    layout/                # Estrutura da aplicação (Header, Sidebar, etc)
    shared/                # Componentes reutilizáveis com semântica leve
    feedback/              # Loading, erro, empty states
    forms/                 # Componentes de formulário
  features/
    <feature-name>/
      components/          # Componentes específicos da feature
      hooks/               # Hooks da feature (estado e lógica)
      services/            # Chamadas API / mocks
      interfaces/          # Tipagens da feature
      mappers/             # Transformação de dados (API <-> UI)
      utils/               # Helpers da feature
  hooks/                   # Hooks globais
  services/                # Serviços globais (ex: API base)
  interfaces/              # Tipos globais
  mappers/                 # Mappers globais
  lib/                     # Configurações (axios, fetch, etc)
  constants/               # Constantes
  styles/                  # Estilos globais

public/                    # Arquivos estáticos acessíveis diretamente
  images/                  # Imagens (png, jpg, svg)
  icons/                   # Ícones
  fonts/                   # Fontes customizadas
  videos/                  # Vídeos (se houver)
  favicon.ico              # Favicon da aplicação

## Organização da pasta components

### components/ui
- Componentes totalmente reutilizáveis (design system)
- Sem regra de negócio
- Exemplos: Button, Input, Card, Modal

### components/layout
- Componentes estruturais da aplicação
- Exemplos: Header, Sidebar, Footer, PageWrapper

### components/shared
- Componentes reutilizáveis com leve contexto de domínio
- Exemplos: UserCard, ProductCard, SectionHeader

### components/feedback
- Estados visuais da aplicação
- Exemplos: Loading, Skeleton, ErrorState, EmptyState

### components/forms
- Componentes relacionados a formulários
- Exemplos: FormField, FormLabel, FormError, ControlledInput

## Regras de Arquitetura

### 1. Componentes
- Devem ser burros (presentational) sempre que possível
- Não devem conter lógica de negócio complexa
- Recebem dados via props
- Devem ser pequenos e reutilizáveis
- Se crescerem demais, dividir ou mover lógica para hooks

### 2. Hooks
- Centralizam lógica de estado e comportamento
- Fazem orquestração entre services e UI
- Nome padrão: use<Feature><Action>

Exemplo:
useUserProfile
useDashboardData

### 3. Services
- Responsáveis por chamadas HTTP
- Não devem conter lógica de UI
- Devem ser facilmente substituíveis (mock -> API real)

### 4. Interfaces (TypeScript)
- Separar DTOs de API e modelos de UI
- Nunca misturar tipagem de API com UI diretamente

### 5. Mappers
- Transformam dados da API em formato consumível pela UI

Exemplo:
UserDTO -> UserModel

### 6. Páginas (Next.js App Router)
- Devem ser finas
- Apenas composição de componentes + uso de hooks

### 7. Boas práticas obrigatórias

- Não misturar lógica + UI + fetch no mesmo arquivo
- Não usar any
- Não acessar API direto em componente
- Sempre usar hooks para estado
- Sempre usar services para dados externos
- Criar mappers quando houver transformação

## Regras específicas para components

- Componentes globais não devem depender de features
- Componentes específicos devem ficar dentro de features/<feature>/components
- Evitar componentes grandes (acima de ~200 linhas)
- Sempre que necessário, dividir em subcomponentes
- Utilizar barrel files (index.ts) para exportação
- Manter consistência de estrutura de arquivos

### Estrutura padrão de um componente

ComponentName/
  ComponentName.tsx
  ComponentName.types.ts
  ComponentName.styles.ts (opcional)
  index.ts

## Padrões recomendados

- SOLID aplicado ao frontend
- Separation of Concerns
- Container / Presentational Pattern
- Feature-first organization
- DRY (sem duplicação)
- KISS (simplicidade)

## Sugestões de Design Frontend

- Criar um design system básico em components/ui
- Usar Tailwind com consistência (tokens de cor, spacing)
- Utilizar as variáveis globais de CSS já existentes no projeto (definidas em :root ou arquivos globais)
- Evitar hardcode de cores, fontes, espaçamentos e tamanhos
- Priorizar uso de tokens (ex: var(--color-primary), var(--spacing-md))
- Garantir consistência visual em toda a aplicação

## Estratégia de Refatoração

1. Identificar arquivos que misturam:
   - estado
   - UI
   - chamadas API

2. Separar em:
   - hook
   - component
   - service

3. Criar interfaces tipadas

4. Criar mappers se necessário

5. Ajustar imports

## Verificação obrigatória após cada alteração

Após qualquer modificação no código, você deve obrigatoriamente validar que a aplicação continua íntegra executando:

- Instalar dependências (se necessário):
  npm install

- Rodar build de produção:
  npm run build

- Caso o projeto utilize outro package manager, adaptar:
  - yarn build
  - pnpm build

Regras:
- Nunca prosseguir se o build estiver quebrando
- Corrigir todos os erros de tipagem e build antes de continuar
- Garantir que não há erros de TypeScript
- Garantir que não há erros de lint (se aplicável)

## Entregáveis

Para cada refatoração você deve:

- Mostrar estrutura de pastas final
- Criar arquivos separados corretamente
- Explicar rapidamente as decisões
- Garantir tipagem forte
- Confirmar que o build passou com sucesso

## Importante

- Não quebrar a aplicação existente
- Manter compatibilidade
- Melhorar legibilidade e manutenção
- Código deve parecer produção nível sênior

Agora analise o projeto atual e comece a refatoração seguindo essas diretrizes.
