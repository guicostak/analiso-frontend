import React from 'react';
import { Activity, DollarSign, TrendingUp, BarChart3, Shield, Database } from 'lucide-react';
import type { AnalysisTab } from '../interfaces';

// ─── Colors ──────────────────────────────────────────────────────────────────
// Palette based on color theory: muted saturation (45-65%) for professionalism,
// analogous harmony (blue-teal-green) for cohesion, split-complementary accents.
// Inspired by Stripe/Linear/Bloomberg — 60-30-10 rule: neutral/primary/accent.

export const COLORS = {
  value: '#5B6AC0',       // Muted indigo — trust, analytical depth
  future: '#3E8ED0',      // Steel blue — forward-looking, clarity
  past: '#2EAA8A',        // Teal green — grounded, historical
  health: '#D4913B',      // Warm amber — attention without alarm
  dividend: '#8B6CDB',    // Soft violet — income, reward
  positive: '#2D9F6F',    // Forest green — muted success
  negative: '#C74B4B',    // Soft coral — risk without aggression
  neutral: '#8A8F9C',     // Cool gray
  muted: '#E8EBF0',       // Light cool gray
  forecast: '#8CBAE0',    // Pastel steel blue
  historical: '#3E8ED0',  // Matches future
  bg: '#F7F8FA',          // Near-white with cool undertone
};

export const DIMENSION_COLORS: Record<string, string> = {
  value: COLORS.value,
  future: COLORS.future,
  past: COLORS.past,
  health: COLORS.health,
  dividend: COLORS.dividend,
};

// ─── Tab Config ──────────────────────────────────────────────────────────────

export const TABS: { id: AnalysisTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Visão Geral', icon: React.createElement(Activity, { className: 'w-4 h-4' }) },
  { id: 'value', label: 'Valuation', icon: React.createElement(DollarSign, { className: 'w-4 h-4' }) },
  { id: 'future', label: 'Crescimento Futuro', icon: React.createElement(TrendingUp, { className: 'w-4 h-4' }) },
  { id: 'past', label: 'Performance Passada', icon: React.createElement(BarChart3, { className: 'w-4 h-4' }) },
  { id: 'health', label: 'Saúde Financeira', icon: React.createElement(Shield, { className: 'w-4 h-4' }) },
  { id: 'dividend', label: 'Dividendos', icon: React.createElement(DollarSign, { className: 'w-4 h-4' }) },
  { id: 'sources', label: 'Fontes de dados', icon: React.createElement(Database, { className: 'w-4 h-4' }) },
];

// ─── Dimension intro texts ────────────────────────────────────────────────────

export const DIMENSION_INTRO: Record<string, string> = {
  value: 'O preço atual da ação está abaixo, acima ou próximo do que ela realmente vale? Aqui comparamos o preço de mercado com estimativas de valor calculadas por diferentes métodos. Isso ajuda a identificar se existe oportunidade ou se o mercado já está pagando caro.',
  future: 'A empresa vai crescer nos próximos anos? Aqui mostramos as projeções de lucro e receita feitas por analistas profissionais. Quanto mais forte e previsível o crescimento esperado, mais confiança a empresa transmite para quem investe pensando no longo prazo.',
  past: 'A empresa tem um bom histórico de resultados? Aqui analisamos se o lucro cresceu ao longo dos anos, se as margens se mantiveram saudáveis e se a operação gerou retorno real. Empresas com padrão consistente no passado tendem a manter a qualidade.',
  health: 'A empresa consegue pagar suas contas e sobreviver a momentos difíceis? Aqui avaliamos o nível de endividamento, a capacidade de pagar juros e se o caixa gerado pela operação é suficiente para manter tudo funcionando.',
  dividend: 'Os dividendos pagos valem a pena? Aqui mostramos se o rendimento é bom comparado ao mercado, se a empresa tem lucro suficiente para continuar pagando e se existe histórico de pagamento consistente. Dividendo alto sem lucro por trás é sinal de alerta.',
};

// ─── Section IDs ─────────────────────────────────────────────────────────────

export const SECTION_IDS = ['overview', 'value', 'future', 'past', 'health', 'dividend', 'sources'] as const;
