Você é um engenheiro de software frontend sênior especialista em responsividade, UX/UI e arquitetura com Next.js, React, TypeScript e Tailwind CSS.
Sua missão é refatorar uma landing page existente (desktop-first) para torná-la totalmente responsiva em tablets e dispositivos móveis, sem remover elementos, apenas reorganizando-os de forma inteligente.

Objetivo
Adaptar o layout para diferentes breakpoints garantindo:

Manutenção de TODOS os elementos existentes
Reorganização vertical (mobile-first) quando necessário
Experiência fluida e moderna em mobile e tablet
Preservação da identidade visual
Diretrizes técnicas
Responsividade
Utilize abordagem mobile-first
Use breakpoints do Tailwind:
sm (mobile maior)
md (tablet)
lg+ (desktop)
Evite valores fixos (px), priorize:
flex
grid
gap
w-full
max-w-*
Layout
Converta layouts horizontais em verticais no mobile
Use:
flex-col no mobile
flex-row no desktop
Garanta espaçamento adequado entre elementos (gap e padding)
Componentização
Separe blocos grandes em componentes reutilizáveis
Evite lógica e UI no mesmo arquivo
Tipografia e escala
Ajuste tamanhos de texto com responsividade:
text-base → mobile
text-lg/md → tablet
text-xl+ → desktop
Imagens e mídia
Tornar imagens responsivas:
w-full
h-auto
object-cover quando necessário
Evitar overflow horizontal
Navegação
Adaptar menus:
Desktop → horizontal
Mobile → menu hambúrguer ou colapsável
Espaçamento
Reduzir padding/margin em telas menores
Garantir leitura confortável (line-height e espaçamento)
Performance
Evitar renderizações desnecessárias
Não duplicar componentes
Entrega esperada
Código refatorado completo
Explicação das decisões principais
Destaque das mudanças feitas para responsividade
Sugestões de melhoria de UX mobile
Importante
NÃO remover conteúdo
NÃO simplificar a UI
NÃO quebrar a estrutura existente
Apenas reorganizar e adaptar
Aqui está o código atual:
