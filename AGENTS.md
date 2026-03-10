# AGENTS.md — Analiso Frontend

## Missão
Você está trabalhando no frontend da Analiso.

A Analiso transforma dados financeiros em leitura guiada, clara e verificável.
O frontend deve sempre priorizar:
- clareza
- contexto
- confiança
- redução de sobrecarga cognitiva
- progressão de entendimento
- ativação rápida

A Analiso não deve parecer:
- terminal financeiro
- dashboard NASA
- screener frio
- tour de funcionalidades
- produto que empurra decisão financeira

## Promessa do produto
A Analiso vende:
- clareza
- confiança
- leitura guiada
- contexto verificável
- acompanhamento sem ruído

A Analiso não vende:
- excesso de indicadores
- complexidade para parecer robusta
- efeitos visuais sem função
- urgência artificial
- recomendação de compra/venda

## Princípios obrigatórios
1. Insight before raw data.
2. Start from user pain, not from features.
3. Reduce cognitive load aggressively.
4. Organize by business context, not by chart type.
5. Every major block must answer: "e daí?"
6. Show:
   - o que importa agora
   - por que importa
   - como confirmar
7. Secondary content must be compact, collapsible or contextual.
8. The interface must feel educational, calm and trustworthy.
9. The product should guide without manipulating.
10. Trust must come from traceability: source, date, evidence.

## Regras visuais
- Teal = marca / foco / ação
- Green = saudável / positivo
- Amber = atenção
- Coral = risco
- Neutral = estrutura / metadados / bordas / shell

Não usar cor como decoração.
Não deixar o shell vencer o conteúdo.
Não deixar market green/red dominar a linguagem da tela.

## Regras de navegação e CTA
Preferir:
- Abrir análise
- Ver fonte
- Comparar
- Criar alerta
- Ver prioridades do dia
- Entender impacto

Evitar:
- Ver empresa
- Ver ativo
- Ver mais
- Continuar quando o próximo passo não estiver claro
- Saiba mais

## Componentes assinatura
### Mapa dos 5 pilares
- É componente de síntese visual.
- Não é recomendação.
- Não é gráfico técnico de precisão.
- Ordem fixa dos pilares:
  1. Dívida
  2. Caixa
  3. Margens
  4. Retorno
  5. Proventos
- Deve sempre ter score geral no centro.
- Deve sempre ser apoiado por chips e leitura textual ao redor.
- Nunca usar visual default de biblioteca sem customização.

## Regras por página
### Dashboard
Pergunta que deve responder:
- o que mudou hoje?
- onde devo olhar primeiro?
- o que merece ação agora?

### Watchlist
Pergunta que deve responder:
- o que mudou?
- o que merece atenção?
- o que eu faço com isso?

Triagem primeiro. Organização depois.

### Explorar
Pergunta que deve responder:
- o que vale abrir hoje?
- que empresas combinam com a tese que procuro?

Descoberta guiada primeiro. Mercado como pano de fundo.

### Comparação
Pergunta que deve responder:
- quem está melhor hoje?
- onde está a maior diferença?
- onde devo olhar com cuidado?
- como confirmo isso?

Veredito antes de evidência detalhada.

### Análise da empresa
Pergunta que deve responder:
- qual é o diagnóstico da empresa?
- o que está bem?
- o que pede atenção?
- o que mudou?
- o que acompanhar daqui pra frente?

### Onboarding
Pergunta que deve responder:
- qual a maior dor do usuário?
- como provo valor rápido?
- qual setup mínimo realmente acelera valor?

Onboarding é ativação, não tour.

## Comportamento esperado do agente
Antes de editar qualquer tela, identificar:
1. intenção primária da página
2. ação principal da página
3. principal dor do usuário nessa tela
4. blocos que competem entre si
5. o que deve ser protagonista e o que deve ser rebaixado

Antes de finalizar qualquer tarefa, revisar:
- o usuário entende o que importa em segundos?
- há blocos redundantes?
- o CTA principal está explícito?
- existe ruído desnecessário?
- há algo que deveria estar colapsado ou aparecer depois?
- a copy está genérica?
- a tela está ensinando ou só exibindo?
- isso parece Analiso ou parece template SaaS/financeiro genérico?

## Regras de engenharia
- Preferir refactors incrementais.
- Não adicionar dependências grandes sem necessidade clara.
- Recharts pode ser usado como motor, mas componentes assinatura precisam de camada visual própria.
- Evitar defaults visuais de biblioteca.
- Manter componentes compostos e reutilizáveis.
