"use client";

import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  CreditCard,
  Bell,
  Bookmark,
  FileText,
  ClipboardList,
  Boxes,
  DollarSign,
  FilePenLine,
  FolderKanban,
  MessageCircleMore,
  Mail,
  NotebookPen,
  Presentation,
  Receipt,
  RefreshCw,
  Shield,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import logoImage from "@/src/assets/logos/logo.png";
import { CompanyAnalysisAgendaMock } from "./CompanyAnalysisAgendaMock";
import { CompanyAnalysisChangesMock } from "./CompanyAnalysisChangesMock";
import { CompanyCompareMock } from "./CompanyCompareMock";
import { CompanyDashboardMock } from "./CompanyDashboardMock";
import { CompanyExploreMock } from "./CompanyExploreMock";
import { CompanyAnalysisPillarsMock } from "./CompanyAnalysisPillarsMock";
import { CompanyAnalysisPriceMock } from "./CompanyAnalysisPriceMock";
import { CompanyWatchlistMock } from "./CompanyWatchlistMock";
import { AnalysisFlowSection } from "./AnalysisFlowSection";
import { CompanyAnalysisSummaryMock } from "./CompanyAnalysisSummaryMock";
import { ReadableCompanySection } from "./ReadableCompanySection";
import { HeroDashboardMock } from "./HeroDashboardMock";

const navItems = ["Início", "Atuação", "Solução", "Assistentes IA", "FAQ"] as const;

const heroChips = [
  "Leitura guiada",
  "Resultados",
  "Mudanças",
  "Pontos de atenção",
  "Contexto histórico",
  "Comparação setorial",
  "Watchlist",
  "Acompanhamento",
] as const;

const heroSearchResults = [
  {
    ticker: "WEGE3",
    name: "WEG S.A.",
    sector: "Bens Industriais",
    available: "Análise disponível",
  },
  {
    ticker: "EGIE3",
    name: "Engie Brasil Energia",
    sector: "Energia Elétrica",
    available: "Demo",
  },
  {
    ticker: "TOTS3",
    name: "TOTVS",
    sector: "Tecnologia",
    available: "Demo",
  },
] as const;

const segmentsOld = [
  {
    title: "Quem está começando a analisar empresas",
    description:
      "Entenda os principais sinais de uma empresa com explicações claras, contexto e menos sobrecarga logo na primeira leitura.",
  },
  {
    title: "Quem já acompanha algumas empresas",
    description:
      "Compare resultados, acompanhe mudanças relevantes e retome sua análise com mais rapidez e confiança.",
  },
  {
    title: "Quem quer aprofundar sem virar refém de dashboard",
    description:
      "Vá além dos números soltos com uma visão mais estruturada, contextualizada e fácil de verificar.",
  },
] as const;

const segments = [
  {
    title: "Quem está começando a analisar",
    description:
      "Entenda os sinais mais importantes da empresa com uma leitura mais guiada, simples e menos intimidante.",
  },
  {
    title: "Quem já acompanha algumas empresas",
    description:
      "Retome sua análise com mais rapidez, veja o que mudou e mantenha contexto sem reconstruir tudo do zero.",
  },
  {
    title: "Quem quer aprofundar com mais critério",
    description:
      "Vá além dos indicadores soltos com contexto, sequência histórica e pontos de atenção mais verificáveis.",
  },
] as const;

const steps = [
  {
    label: "Primeiro olhar",
    title: "Entenda o essencial mais rápido",
    items: [
      "Veja os sinais mais importantes da empresa",
      "Comece com uma leitura mais guiada",
      "Entenda o básico sem excesso de indicadores",
      "Ganhe contexto antes de aprofundar",
    ],
  },
  {
    label: "Leitura aprofundada",
    title: "Vá além dos números soltos",
    items: [
      "Explore indicadores com mais contexto",
      "Entenda o que mudou ao longo do tempo",
      "Identifique pontos de atenção com mais clareza",
      "Analise com mais confiança e menos confusão",
    ],
  },
  {
    label: "Acompanhamento",
    title: "Retome sua análise sem ruído",
    items: [
      "Acompanhe empresas ao longo do tempo",
      "Veja mudanças relevantes com mais contexto",
      "Volte para o que importa mais rápido",
      "Mantenha sua leitura organizada e verificável",
    ],
  },
] as const;

const faqs = [
  "O que a Analiso entrega na prática?",
  "A Analiso recomenda compra ou venda?",
  "Como a análise é construída e como eu verifico as fontes?",
  "Como a Analiso mostra o que mudou em uma empresa?",
  "Qual a diferença entre Dashboard, Watchlist, Explorar e Comparação?",
  "Para quem a Analiso foi feita?",
] as const;

const faqItems = [
  {
    question: "O que a Analiso entrega na prática?",
    answer:
      "A Analiso organiza dados financeiros em uma leitura guiada para você entender o que importa, o que mudou, onde olhar primeiro e como confirmar cada ponto com fonte e contexto.",
  },
  {
    question: "A Analiso recomenda compra ou venda?",
    answer:
      "Não. A Analiso não dá recomendação de compra ou venda. O papel do produto é ajudar você a ler melhor uma empresa, reduzir ruído e tomar decisões com mais clareza e confiança.",
  },
  {
    question: "Como a análise é construída e como eu verifico as fontes?",
    answer:
      "A leitura combina indicadores financeiros, contexto histórico, comparação e sinais recentes da empresa. Sempre que possível, a análise aponta de onde veio a informação, a data e como você pode verificar o dado na fonte.",
  },
  {
    question: "Como a Analiso mostra o que mudou em uma empresa?",
    answer:
      "A Analiso destaca mudanças relevantes, separa o que é rotina do que realmente altera a leitura e indica por que aquilo importa para o diagnóstico da empresa e para o acompanhamento daqui para frente.",
  },
  {
    question: "Qual a diferença entre Dashboard, Watchlist, Explorar e Comparação?",
    answer:
      "O Dashboard ajuda a começar pelo que merece atenção no dia. A Watchlist organiza o acompanhamento das empresas que você já monitora. Explorar ajuda a descobrir novas empresas com mais critério. Comparação mostra quem está melhor hoje, onde está a maior diferença e o que vale confirmar.",
  },
  {
    question: "Para quem a Analiso foi feita?",
    answer:
      "A Analiso foi pensada para quem quer entender empresas com mais clareza, tenha você mais experiência ou esteja começando. O foco é reduzir sobrecarga, ensinar enquanto mostra e dar contexto verificável para acompanhar melhor cada caso.",
  },
] as const;

void faqs;

const legacyMarqueeItems = [
  { label: "Mensagens", icon: MessageCircleMore },
  { label: "Agenda", icon: CalendarDays },
  { label: "Notificações", icon: Bell },
  { label: "Estoque", icon: Boxes },
  { label: "Pacientes", icon: Users },
  { label: "Prontuário", icon: NotebookPen },
  { label: "Rotinas", icon: ClipboardList },
  { label: "Serviços", icon: FilePenLine },
  { label: "Consultas", icon: Stethoscope },
  { label: "Análises", icon: Presentation },
  { label: "Documentos", icon: FileText },
  { label: "Equipe", icon: Users },
  { label: "Financeiro", icon: DollarSign },
  { label: "Indicadores", icon: Presentation },
  { label: "Lembretes", icon: NotebookPen },
  { label: "Receitas", icon: Receipt },
  { label: "Assistentes", icon: Bot },
  { label: "Histórico", icon: FolderKanban },
  { label: "Despesas", icon: Wallet },
  { label: "Automação", icon: RefreshCw },
  { label: "Integrações", icon: FolderKanban },
  { label: "Cobranças", icon: CreditCard },
  { label: "Alertas", icon: TriangleAlert },
  { label: "Relatórios", icon: Presentation },
  { label: "Insights", icon: Presentation },
] as const;

void legacyMarqueeItems;

const marqueeItems = [
  { label: "Diagnóstico", icon: ClipboardList },
  { label: "Mudanças", icon: RefreshCw },
  { label: "Agenda", icon: CalendarDays },
  { label: "Preço", icon: DollarSign },
  { label: "Comparação", icon: Presentation },
  { label: "Watchlist", icon: Bookmark },
  { label: "Fontes", icon: FileText },
  { label: "Contexto", icon: NotebookPen },
] as const;

function AnalisoLogo() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-[12px] bg-[linear-gradient(140deg,#7fe4d6,#0f9f8f)] opacity-90" />
        <span className="absolute left-[3px] top-[3px] h-4 w-4 rounded-[6px] bg-white/75 blur-[1px]" />
        <span className="absolute bottom-[3px] right-[3px] h-4 w-4 rounded-[6px] bg-white/35" />
      </span>
      <span className="text-[22px] font-semibold tracking-[-0.04em] text-[#111111]">
        analiso
      </span>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1430px] flex-wrap items-center justify-between px-8 pt-8 max-md:px-4 max-md:pt-5">
        <a href="/" className="order-1 flex shrink-0 items-center">
          <img
            src={logoImage.src}
            alt="Analiso"
            className="h-[25px] w-auto max-md:h-[20px]"
            draggable="false"
          />
        </a>

        <div className="absolute left-1/2 order-2 flex -translate-x-1/2 items-center gap-0.5 max-md:hidden">
          <a
            href="/"
            className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-[#5f5f5f] max-md:px-1.5 max-md:py-1.5 max-md:text-[11px]"
          >
            Início
          </a>
          <a
            href="#atuacao"
            className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-[#5f5f5f] max-md:px-1.5 max-md:py-1.5 max-md:text-[11px]"
          >
            Atuação
          </a>
          <a
            href="#solucao"
            className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-[#5f5f5f] max-md:px-1.5 max-md:py-1.5 max-md:text-[11px]"
          >
            Solução
          </a>
          <a
            href="#assistentes"
            className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-[#5f5f5f] max-md:px-1.5 max-md:py-1.5 max-md:text-[11px]"
          >
            Assistentes IA
          </a>
          <a
            href="#faq"
            className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-[#5f5f5f] max-md:px-1.5 max-md:py-1.5 max-md:text-[11px]"
          >
            FAQ
          </a>
        </div>

        <a
          href="/login"
          className="order-3 flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[#ececec] bg-white px-4 py-3.5 text-sm font-semibold leading-5 text-black shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:border-[#d9d9d9] hover:ring-2 hover:ring-[#d7f5f0] hover:ring-offset-2 hover:ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#d7f5f0] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] max-md:h-8 max-md:px-3 max-md:py-1.5 max-md:text-xs"
        >
          Entrar
        </a>
      </div>
    </header>
  );
}

function EmailForm() {
  return (
    <div className="mx-auto flex w-full max-w-[370px] items-center rounded-[18px] border border-[#e7e7e7] bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 text-[#a9a9a9]">
        <Mail className="h-4 w-4 shrink-0" />
        <span className="truncate text-[14px]">Seu e-mail</span>
      </div>
      <button className="rounded-[13px] bg-[#2f7df6] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(47,125,246,0.3)]">
        Entrar na lista
      </button>
    </div>
  );
}

function SectionHeading({
  badge,
  title,
  description,
  dark = false,
}: {
  badge: string;
  title: React.ReactNode;
  description: string;
  dark?: boolean;
}) {
  return (
    <div className={`mx-auto text-center ${dark ? "max-w-[760px]" : "max-w-[700px]"}`}>
      <div
        className={`inline-flex rounded-[8px] px-3 py-1 text-[12px] font-semibold ${
          dark ? "bg-[#031833] text-[#3E95FF]" : "bg-[#e7fbf7] text-[#0f9f8f]"
        }`}
      >
        {badge}
      </div>
      <h2
        className={`mt-6 font-semibold ${
          dark
            ? "assistants-heading text-center text-[56px] leading-[62px] tracking-[-1.12px] text-white max-md:text-[36px] max-md:leading-[40px] max-md:tracking-[-0.72px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.56px]"
            : "text-[38px] leading-[0.98] tracking-[-0.05em] text-[#262626] md:text-[56px]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mx-auto mt-6 ${
          dark
            ? "max-w-[558px] text-center text-lg leading-6 text-[#999]"
            : "max-w-[540px] text-[17px] leading-[1.4] text-[#7a7a7a]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: 0.78,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}

function HeroDashboard() {
  return <HeroDashboardMock />;
}

function SegmentVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="relative h-[252px] w-[280px] overflow-hidden rounded-[20px] bg-white">
        <div className="absolute inset-x-[16px] top-[16px] bottom-[16px] rounded-[22px] border border-[#dff2ed] bg-[linear-gradient(180deg,#f4fcfa_0%,#ffffff_100%)] px-[18px] py-[18px] shadow-[0_10px_28px_rgba(15,159,143,0.08)]">
          <div className="flex items-center justify-between">
            <div className="h-[8px] w-[82px] rounded-full bg-[#d7ebe6]" />
            <div className="h-[22px] w-[64px] rounded-full border border-[#cdebe4] bg-[#e9faf6]" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-[18px] border border-[#d9eee8] bg-white px-3 py-4 shadow-[0_2px_10px_rgba(15,159,143,0.04)]">
              <div className="h-[8px] w-[34px] rounded-full bg-[#d7ebe6]" />
              <div className="mt-4 h-[44px] rounded-[14px] bg-[#eef8f5]" />
            </div>
            <div className="rounded-[18px] border border-[#cdebe4] bg-white px-3 py-4 shadow-[0_8px_18px_rgba(15,159,143,0.10)]">
              <div className="h-[8px] w-[40px] rounded-full bg-[#c3e8e0]" />
              <div className="mt-4 h-[52px] rounded-[14px] bg-[linear-gradient(180deg,#dff8f3_0%,#eefbf8_100%)]" />
            </div>
            <div className="rounded-[18px] border border-[#d9eee8] bg-white px-3 py-4 shadow-[0_2px_10px_rgba(15,159,143,0.04)]">
              <div className="h-[8px] w-[30px] rounded-full bg-[#d7ebe6]" />
              <div className="mt-4 h-[44px] rounded-[14px] bg-[#eef8f5]" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-[18px] border border-[#d8efe9] bg-white px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#0f9f8f]" />
              <div className="h-[8px] w-[92px] rounded-full bg-[#c8e9e2]" />
            </div>
            <div className="h-[8px] w-[38px] rounded-full bg-[#e3f4f0]" />
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="relative h-[252px] w-[280px] overflow-hidden rounded-[20px] bg-white">
        <div className="absolute inset-x-[16px] top-[16px] bottom-[16px] rounded-[22px] border border-[#dff2e4] bg-[linear-gradient(180deg,#f5fcf7_0%,#ffffff_100%)] px-[18px] py-[18px] shadow-[0_10px_28px_rgba(34,197,94,0.07)]">
          <div className="flex items-center justify-between">
            <div className="h-[8px] w-[96px] rounded-full bg-[#d7ebe0]" />
            <div className="h-[22px] w-[46px] rounded-full border border-[#d7efdf] bg-[#edf9f1]" />
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-[18px] border border-[#e5f3e8] bg-white px-4 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#98a2a0]" />
                  <div className="h-[8px] w-[88px] rounded-full bg-[#dde8e1]" />
                </div>
                <div className="h-[18px] w-[42px] rounded-full bg-[#f1f3f2]" />
              </div>
            </div>
            <div className="rounded-[18px] border border-[#cdeed8] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(34,197,94,0.10)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
                  <div className="h-[8px] w-[104px] rounded-full bg-[#cfe9d8]" />
                </div>
                <div className="h-[18px] w-[42px] rounded-full bg-[#edf9f1]" />
              </div>
              <div className="mt-3 h-[8px] w-[146px] rounded-full bg-[#e7f3eb]" />
            </div>
            <div className="rounded-[18px] border border-[#e5f3e8] bg-white px-4 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#c26b2c]" />
                  <div className="h-[8px] w-[94px] rounded-full bg-[#ebe2d6]" />
                </div>
                <div className="h-[18px] w-[42px] rounded-full bg-[#fff3e7]" />
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-[18px] border border-[#dff2e4] bg-white px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#16a34a]" />
              <div className="h-[8px] w-[84px] rounded-full bg-[#cfe9d8]" />
            </div>
            <div className="h-[8px] w-[42px] rounded-full bg-[#e8f6ec]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[252px] w-[280px] overflow-hidden rounded-[20px] bg-white">
      <div className="absolute inset-x-[16px] top-[16px] bottom-[16px] rounded-[22px] border border-[#e1e8ff] bg-[linear-gradient(180deg,#f7f9ff_0%,#ffffff_100%)] px-[18px] py-[18px] shadow-[0_10px_28px_rgba(76,103,178,0.07)]">
        <div className="flex items-center justify-between">
          <div className="h-[8px] w-[88px] rounded-full bg-[#dde5fb]" />
          <div className="h-[22px] w-[70px] rounded-full border border-[#d9e2ff] bg-[#eef2ff]" />
        </div>
        <div className="mt-5 flex items-end gap-3">
          <div className="flex-1 rounded-[18px] border border-[#e5ebfb] bg-white px-3 py-3">
            <div className="flex h-[72px] items-end rounded-[14px] bg-[#f5f7fd] px-2 pb-2">
              <div className="h-[38%] w-full rounded-[10px] bg-[#d6dfff]" />
            </div>
          </div>
          <div className="flex-1 rounded-[18px] border border-[#dde5ff] bg-white px-3 py-3 shadow-[0_8px_20px_rgba(76,103,178,0.08)]">
            <div className="flex h-[88px] items-end rounded-[14px] bg-[#f5f7fd] px-2 pb-2">
              <div className="h-[58%] w-full rounded-[10px] bg-[#9eb7ff]" />
            </div>
          </div>
          <div className="flex-1 rounded-[18px] border border-[#d2ddff] bg-white px-3 py-3 shadow-[0_10px_22px_rgba(76,103,178,0.10)]">
            <div className="flex h-[100px] items-end rounded-[14px] bg-[#f5f7fd] px-2 pb-2">
              <div className="h-[76%] w-full rounded-[10px] bg-[#4c67b2]" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-[18px] border border-[#e6ebf8] bg-white px-4 py-4">
            <div className="h-[8px] w-[70px] rounded-full bg-[#dae3fb]" />
            <div className="mt-3 h-[8px] w-[118px] rounded-full bg-[#edf2ff]" />
          </div>
          <div className="w-[72px] rounded-[18px] border border-[#dce4ff] bg-white px-3 py-4">
            <div className="h-[10px] w-[10px] rounded-full bg-[#4c67b2]" />
            <div className="mt-4 h-[8px] w-full rounded-full bg-[#e5ebfb]" />
            <div className="mt-2 h-[8px] w-[70%] rounded-full bg-[#eef2ff]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SegmentCard({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  if (false) {
    return (
    <div
      className={`flex flex-1 flex-col items-center gap-6 bg-white pb-12 pt-10 max-md:gap-4 max-md:rounded-none max-md:pb-8 max-md:pt-6 ${
        index === 0
          ? "rounded-r-[20px]"
          : index === 1
            ? "rounded-[20px]"
            : "rounded-l-[20px]"
      }`}
    >
      <SegmentVisual index={index} />
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-[590] leading-6 text-[#171717]">{title}</h3>
        <p className="max-w-[333px] text-base leading-6 text-[#7a7a7a]">{description}</p>
      </div>
    </div>
    );
  }

  return (
    <div
      className={`flex flex-1 flex-col items-center gap-6 bg-white pb-12 pt-10 max-md:gap-4 max-md:rounded-none max-md:pb-8 max-md:pt-6 ${
        index === 0
          ? "rounded-r-[20px]"
          : index === 1
            ? "rounded-[20px]"
            : "rounded-l-[20px]"
      }`}
    >
      <div className="relative h-[252px] w-[280px] overflow-hidden rounded-[20px] bg-white">
        {index === 0 && (
          <>
            <div className="absolute inset-x-[16px] top-[16px] bottom-[16px] rounded-[22px] border border-[#dff2ed] bg-[linear-gradient(180deg,#f4fcfa_0%,#ffffff_100%)] px-[18px] py-[18px] shadow-[0_10px_28px_rgba(15,159,143,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a8a86]">
                    Empresa
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#171717]">WEGE3 · WEG S.A.</div>
                </div>
                <span className="rounded-full bg-[#dff8f3] px-2.5 py-1 text-[10px] font-semibold text-[#0f9f8f]">
                  Visão inicial
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Receita", value: "+12,4%" },
                  { label: "Margem", value: "17,8%" },
                  { label: "Caixa", value: "Sólido" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[16px] border border-[#e5f3ef] bg-white px-3 py-3 text-center shadow-[0_2px_10px_rgba(15,159,143,0.04)]"
                  >
                    <div className="text-[10px] font-medium text-[#7f8b87]">{item.label}</div>
                    <div className="mt-2 text-[13px] font-semibold text-[#171717]">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[18px] border border-[#d8efe9] bg-white px-4 py-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#0f9f8f]">
                  <Check className="h-4 w-4" />
                  Primeira leitura guiada
                </div>
                <p className="mt-2.5 text-[12px] leading-[18px] text-[#4a5955]">
                  O essencial aparece junto para você começar sem se perder.
                </p>
              </div>
            </div>
          </>
        )}
        {index === 1 && (
          <>
            <div className="absolute inset-x-[16px] top-[16px] bottom-[16px] rounded-[22px] border border-[#dff2e4] bg-[linear-gradient(180deg,#f5fcf7_0%,#ffffff_100%)] px-[18px] py-[18px] shadow-[0_10px_28px_rgba(34,197,94,0.07)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a8a86]">
                    Atualizações
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#171717]">Retomar sem recomeçar</div>
                </div>
                <span className="rounded-full bg-[#e8fcee] px-2.5 py-1 text-[10px] font-semibold text-[#16a34a]">
                  Em dia
                </span>
              </div>

              <div className="mt-4 rounded-[18px] border border-[#e4f3e8] bg-white px-3 py-3">
                <div className="mb-2 flex items-center justify-between text-[10px] font-medium text-[#7b8783]">
                  <span>Últimas mudanças</span>
                  <span className="text-[#16a34a]">continuidade ativa</span>
                </div>
                <div className="space-y-2.5">
                {[
                  {
                    label: "Novo",
                    title: "Receita segue resiliente",
                    note: "Atualização principal desta leitura",
                    tone: "bg-[#edf9f1] text-[#16a34a]",
                    active: true,
                  },
                  {
                    label: "Atenção",
                    title: "Margem pede acompanhamento",
                    note: "Mudança que merece contexto",
                    tone: "bg-[#fff5e8] text-[#c26b2c]",
                    active: false,
                  },
                  {
                    label: "Estável",
                    title: "Caixa continua sólido",
                    note: "Sem mudança relevante",
                    tone: "bg-[#f4f5f5] text-[#6f7a77]",
                    active: false,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-[16px] border px-3 py-3 ${
                      item.active
                        ? "border-[#cdeed8] bg-white shadow-[0_8px_22px_rgba(34,197,94,0.08)]"
                        : "border-[#edf1f0] bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              item.label === "Novo"
                                ? "bg-[#16a34a]"
                                : item.label === "Atenção"
                                  ? "bg-[#c26b2c]"
                                  : "bg-[#98a2a0]"
                            }`}
                          />
                          <div className="text-[12px] font-semibold text-[#171717]">{item.title}</div>
                        </div>
                        <div className="mt-1 pl-4 text-[11px] text-[#6a7572]">
                          {item.label === "Novo"
                            ? "Entrou desde a última leitura"
                            : item.label === "Atenção"
                              ? "Mudou e merece atenção"
                              : "Permanece sem ruído"}
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.tone}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-[#dff2e4] bg-white px-4 py-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#16a34a]">
                  <RefreshCw className="h-4 w-4" />
                  Retomar análise
                </div>
                <p className="mt-2.5 text-[12px] leading-[18px] text-[#4a5955]">
                  O que mudou aparece sem você reconstruir a leitura do zero.
                </p>
              </div>
            </div>
          </>
        )}
        {index === 2 && (
          <>
            <div className="absolute inset-x-[16px] top-[16px] bottom-[16px] rounded-[22px] border border-[#e1e8ff] bg-[linear-gradient(180deg,#f7f9ff_0%,#ffffff_100%)] px-[18px] py-[18px] shadow-[0_10px_28px_rgba(76,103,178,0.07)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a869a]">
                    Comparação
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#171717]">Contexto para aprofundar</div>
                </div>
                <span className="rounded-full bg-[#edf2ff] px-2.5 py-1 text-[10px] font-semibold text-[#4c67b2]">
                  Acima do setor
                </span>
              </div>

              <div className="mt-4 rounded-[18px] border border-[#e6ebf8] bg-white px-4 py-3">
                <div className="mb-3 flex items-center justify-between text-[10px] font-medium text-[#7b87a0]">
                  <span>2022</span>
                  <span>2023</span>
                  <span>2024</span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  {[
                    { height: "42%", tone: "bg-[#cfdcff]" },
                    { height: "63%", tone: "bg-[#9eb7ff]" },
                    { height: "78%", tone: "bg-[#4c67b2]" },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-[78px] w-full items-end rounded-[14px] bg-[#f5f7fd] px-2 pb-2">
                        <div className={`w-full rounded-[10px] ${bar.tone}`} style={{ height: bar.height }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-[#6e7b95]">
                  <span>Histórico</span>
                  <span>Setor</span>
                  <span>Sequência</span>
                </div>
              </div>

              {false && <div className="mt-4 h-[60px] rounded-[18px] border border-[#e1e8ff] bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#4c67b2]">
                  <Presentation className="h-4 w-4" />
                  Leitura com contexto
                </div>
                <p className="mt-1.5 text-[12px] leading-[18px] text-[#4a5955]">
                  Histórico, setor e sequência conectam os sinais com mais critério.
                </p>
              </div>}
              <div className="mt-4 grid gap-3">
                <div className="rounded-[16px] border border-[#e6ebf8] bg-white px-4 py-3.5">
                  <div className="text-[11px] font-medium text-[#7b87a0]">Contexto adicional</div>
                  <div className="mt-2 text-[12px] leading-[18px] text-[#4e5d79]">
                    A leitura histórica continua acima da média do setor nos últimos 3 períodos.
                  </div>
                </div>
                <div className="rounded-[18px] border border-[#e1e8ff] bg-white px-4 py-3.5">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[#4c67b2]">
                    <Presentation className="h-4 w-4" />
                    Leitura com contexto
                  </div>
                  <p className="mt-2 text-[12px] leading-[18px] text-[#4a5955]">
                    Histórico, setor e sequência conectam os sinais com mais critério.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-[590] leading-6 text-[#171717]">{title}</h3>
        <p className="max-w-[333px] text-base leading-6 text-[#7a7a7a]">{description}</p>
      </div>
    </div>
  );
}

export function SolutionSection() {
  const [solutionMode, setSolutionMode] = useState<"analisar" | "acompanhar">("analisar");
  const analysisFeatures = [
    "Visão geral guiada",
    "Leitura por pilares",
    "Mudanças relevantes",
    "Agenda relevante",
    "Leitura de preço",
  ] as const;
  const accompanyFeatures = [
    "Resumo do dia",
    "Watchlist com contexto",
    "Descobrir empresas",
    "Comparação guiada",
  ] as const;
  const reducedMotion = useReducedMotion();
  const analysisFeatureCycleMs = reducedMotion ? 9200 : 7600;
  const [activeAnalysisFeature, setActiveAnalysisFeature] = useState(0);
  const [activeAccompanyFeature, setActiveAccompanyFeature] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (solutionMode === "analisar") {
        setActiveAnalysisFeature((current) => (current + 1) % analysisFeatures.length);
        return;
      }

      setActiveAccompanyFeature((current) => (current + 1) % accompanyFeatures.length);
    }, analysisFeatureCycleMs);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeAccompanyFeature,
    activeAnalysisFeature,
    analysisFeatureCycleMs,
    accompanyFeatures.length,
    analysisFeatures.length,
    solutionMode,
  ]);

  return (
    <>
      <style jsx>{`
        @keyframes analysis-feature-progress {
          from {
            stroke-dashoffset: 50.27;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <section
        id="solucao"
        className="px-20 pb-16 pt-16 max-lg:px-10 max-md:px-6 max-sm:px-4"
      >
        <div className="mx-auto max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <span className="rounded-lg bg-[#e7fbf7] px-2 py-1 text-xs font-semibold leading-[18px] text-[#0f9f8f]">
            Solução
          </span>
          <h2
            className="max-w-[589px] bg-clip-text text-center text-[40px] font-semibold leading-[42px] tracking-[-0.4px] text-transparent max-md:text-[32px] max-md:leading-[36px] max-md:tracking-[-0.32px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.28px]"
            style={{
              backgroundImage: "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
            }}
          >
            Uma forma mais clara de analisar empresas
          </h2>
          <p className="max-w-[476px] text-center text-lg leading-6 text-[#7a7a7a] max-md:text-base max-md:leading-5">
            A Analiso transforma dados financeiros em uma leitura guiada, verificável e fácil de acompanhar, para você entender o que importa sem se perder em dashboards confusos.
          </p>
        </div>

        <div className="mt-16 flex flex-col items-center">
          <div className="z-[2] -mb-[68px] flex items-start max-md:mb-4">
            <div className="h-[68px] w-[76px] max-md:hidden [transform:scaleX(-1)]">
              <div className="h-full w-full rounded-tr-[20px] bg-white" />
            </div>
            <div className="h-[68px] w-[360px] overflow-hidden bg-white max-md:h-auto max-md:w-auto max-md:bg-transparent">
              <div className="mx-auto flex h-10 w-[359px] items-start gap-[2px] rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-[2px]">
                <button
                  type="button"
                  onClick={() => setSolutionMode("analisar")}
                  className={`solucao-tab flex h-full flex-1 cursor-pointer items-center justify-center rounded-[10px] px-4 py-1 text-sm font-medium leading-5 transition-all duration-200 hover:text-[#171717] ${
                    solutionMode === "analisar" ? "solucao-tab-active" : "text-[#8d8d8d]"
                  }`}
                >
                  Analisar
                </button>
                <button
                  type="button"
                  onClick={() => setSolutionMode("acompanhar")}
                  className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-[10px] px-4 py-1 text-sm font-medium leading-5 transition-all duration-200 hover:text-[#171717] ${
                    solutionMode === "acompanhar" ? "solucao-tab-active" : "text-[#8d8d8d]"
                  }`}
                >
                  Acompanhar
                </button>
              </div>
            </div>
            <div className="h-[68px] w-[76px] max-md:hidden">
              <div className="h-full w-full rounded-tl-[20px] bg-white" />
            </div>
          </div>
        </div>

        <div className="relative z-[1] flex h-[620px] w-full max-w-[1430px] flex-col items-center justify-end overflow-hidden rounded-[20px] bg-gradient-to-b from-[#f5f5f5] to-white p-[60px] max-md:h-auto max-md:overflow-visible max-md:rounded-none max-md:bg-none max-md:p-0">
          <div className="relative h-[442px] w-full max-w-[1430px] max-md:h-auto">
            <div className="relative flex h-full w-full items-start gap-4 opacity-100 transition-opacity duration-500 max-md:flex-col max-md:h-auto">
              <div className="flex h-[442px] w-[426px] shrink-0 flex-col items-start justify-between overflow-hidden rounded-[20px] border border-[#f0f0f0] bg-white p-8 shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] max-lg:w-[340px] max-md:hidden">
                <div className="flex w-full flex-col items-start gap-6">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#dbecff] to-white">
                      {solutionMode === "analisar" ? (
                        <Sparkles className="h-5 w-5 text-[#0f9f8f]" />
                      ) : (
                        <Bookmark className="h-5 w-5 text-[#0f9f8f]" />
                      )}
                  </div>
                  <div className="flex w-full flex-col items-start gap-[9px]">
                    <h3 className="text-[20px] font-semibold leading-7 tracking-[-0.2px] text-[#171717]">
                      {solutionMode === "analisar" ? "Analisar" : "Acompanhar"}
                    </h3>
                    <p className="max-w-[315px] text-lg leading-6 text-[#7a7a7a]">
                      {solutionMode === "analisar"
                        ? "Leia a empresa com contexto, sequência e menos ruído em cada etapa da análise."
                        : "Veja o que mudou nas empresas que você acompanha e volte direto para o que merece atenção."}
                    </p>
                  </div>
                </div>

                {false && <div className="flex w-full flex-col items-start gap-2">
                  {[
                    "Agenda inteligente",
                    "Prontuário clínico",
                    "Gestão de estoque",
                    "Chat de conversas",
                    "Gestão de documentos",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className={`features-item flex w-full cursor-pointer items-center gap-[10px] transition-all duration-300 ${
                        index === 3 ? "features-item-active" : ""
                      }`}
                    >
                      <Check className="features-check h-5 w-5 shrink-0 text-[#0f9f8f]" />
                      <svg
                        className="features-progress hidden h-5 w-5 shrink-0 -rotate-90"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="10" cy="10" r="8" stroke="#E8E8E8" strokeWidth="2.5" />
                        <circle
                          className="features-progress-arc"
                          cx="10"
                          cy="10"
                          r="8"
                          stroke="#0E7AFF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{ strokeDasharray: "50.27", strokeDashoffset: "50.27" }}
                        />
                      </svg>
                      <span
                        className="features-label text-base font-medium leading-6 text-[#9a9a9a] transition-all duration-300"
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>}

                <div className="flex w-full flex-col items-start gap-2">
                  {(solutionMode === "analisar"
                    ? analysisFeatures
                    : accompanyFeatures
                  ).map((item, index) => (
                    <button
                      type="button"
                      key={item + index}
                      onClick={() =>
                        solutionMode === "analisar"
                          ? setActiveAnalysisFeature(index)
                          : setActiveAccompanyFeature(index)
                      }
                      className={`features-item flex w-full cursor-pointer items-center gap-[10px] transition-all duration-300 ${
                        (
                          solutionMode === "analisar"
                            ? index === activeAnalysisFeature
                            : index === activeAccompanyFeature
                        )
                          ? "features-item-active"
                          : ""
                      }`}
                    >
                      <Check
                        className={`features-check h-5 w-5 shrink-0 text-[#0f9f8f] ${
                          (
                            solutionMode === "analisar"
                              ? index === activeAnalysisFeature
                              : index === activeAccompanyFeature
                          )
                            ? "hidden"
                            : ""
                        }`}
                      />
                      <svg
                        className={`features-progress h-5 w-5 shrink-0 -rotate-90 ${
                          (
                            solutionMode === "analisar"
                              ? index === activeAnalysisFeature
                              : index === activeAccompanyFeature
                          )
                            ? "block"
                            : "hidden"
                        }`}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="10" cy="10" r="8" stroke="#E8E8E8" strokeWidth="2.5" />
                        <circle
                          className="features-progress-arc"
                          cx="10"
                          cy="10"
                          r="8"
                          stroke="#0f9f8f"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{
                            strokeDasharray: "50.27",
                            strokeDashoffset: "50.27",
                            animation:
                              (
                                solutionMode === "analisar"
                                  ? index === activeAnalysisFeature
                                  : index === activeAccompanyFeature
                              )
                                ? `analysis-feature-progress ${analysisFeatureCycleMs}ms linear forwards`
                                : "none",
                          }}
                        />
                      </svg>
                      <span
                        className={`features-label text-base leading-6 transition-all duration-300 ${
                          (
                            solutionMode === "analisar"
                              ? index === activeAnalysisFeature
                              : index === activeAccompanyFeature
                          )
                            ? "font-semibold text-[#171717]"
                            : "font-medium text-[#9a9a9a]"
                        }`}
                      >
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {false && <div className="relative h-[442px] flex-1 overflow-hidden rounded-[20px] border border-[#f0f0f0] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] max-md:hidden">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.4))]" />
                <div className="absolute left-0 top-0 grid h-full w-full grid-cols-[48px_120px_1fr]">
                  <div className="flex flex-col items-center gap-4 border-r border-[#eef2f8] py-4">
                    <div className="h-7 w-7 rounded-full bg-[linear-gradient(140deg,#7fe4d6,#0f9f8f)]" />
                    <div className="h-7 w-7 rounded-full border border-[#e4e7eb] bg-white" />
                    <div className="h-7 w-7 rounded-full bg-[radial-gradient(circle,#9df0d8,#0f9f8f)] opacity-80" />
                  </div>
                  <div className="border-r border-[#eef2f8] px-3 py-4 text-[11px] text-[#727272]">
                    <div className="flex items-center gap-2 font-semibold text-[#191919]">
                      <div className="h-5 w-5 rounded-full bg-[#d9d9d9]" />
                      Workspace
                    </div>
                    <div className="mt-7 space-y-3">
                      {["Resumo", "Agenda", "Em espera", "Prontuários", "Estoque", "Conversas", "Documentos"].map(
                        (item, index) => (
                          <div key={item} className="flex items-center gap-2">
                            <span
                              className={`h-3 w-3 rounded-full border ${
                                index === 4 ? "border-[#0f9f8f] bg-[#0f9f8f]" : "border-[#d6d6d6]"
                              }`}
                            />
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <div className="text-[14px] font-semibold text-[#1b1b1b]">Documentos</div>
                    <div className="mt-7 h-[230px] rounded-[18px] border border-[#eef2f8] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,247,252,0.9))]" />
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-[-1px] left-[-1px] z-[1] h-[200px] w-[calc(100%+2px)] rounded-b-[20px] bg-gradient-to-t from-white to-transparent" />
                <div className="pointer-events-none absolute right-[-1px] top-[-1px] z-[1] h-[calc(100%+2px)] w-[200px] rounded-r-[20px] bg-gradient-to-l from-white to-transparent" />

                <div className="absolute bottom-[17px] right-[17px] z-[2] h-[195px] w-[198px] overflow-hidden rounded-[16px] border-4 border-white shadow-[0px_4px_28px_0px_rgba(0,0,0,0.05)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_22%,#dff8f3,#7bd8cb_18%,#edf6f4_19%,#edf6f4_60%,#7ba29a_61%,#21433f_100%)]" />
                  <div
                    className="absolute inset-0 rounded-[13px]"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0,34,75,0) 52%, rgba(0,14,31,0.7) 90%)",
                      backdropFilter: "blur(1.2px)",
                      WebkitBackdropFilter: "blur(1.2px)",
                      maskImage: "linear-gradient(to bottom, transparent 50%, black 85%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 50%, black 85%)",
                    }}
                  />
                  <p
                    className="absolute bottom-4 left-4 w-[166px] text-base font-semibold leading-4 text-white"
                    style={{ textShadow: "0px 1.2px 5px rgba(0,0,0,0.19)" }}
                  >
                    Soluções que acompanham seu crescimento
                  </p>
                </div>
              </div>}

              <div className="relative h-[442px] flex-1 overflow-hidden rounded-[20px] border border-[#f0f0f0] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] max-md:hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {solutionMode === "acompanhar" && activeAccompanyFeature === 0 ? (
                    <motion.div
                      key="dashboard-summary"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyDashboardMock />
                      </div>
                    </motion.div>
                  ) : solutionMode === "acompanhar" && activeAccompanyFeature === 1 ? (
                    <motion.div
                      key="watchlist-context"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyWatchlistMock />
                      </div>
                    </motion.div>
                  ) : solutionMode === "acompanhar" && activeAccompanyFeature === 2 ? (
                    <motion.div
                      key="discover-companies"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyExploreMock />
                      </div>
                    </motion.div>
                  ) : solutionMode === "acompanhar" && activeAccompanyFeature === 3 ? (
                    <motion.div
                      key="compare-guided"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyCompareMock />
                      </div>
                    </motion.div>
                  ) : activeAnalysisFeature === 0 ? (
                    <motion.div
                      key="analysis-summary"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyAnalysisSummaryMock />
                      </div>
                    </motion.div>
                  ) : activeAnalysisFeature === 1 ? (
                    <motion.div
                      key="analysis-pillars"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyAnalysisPillarsMock />
                      </div>
                    </motion.div>
                  ) : activeAnalysisFeature === 2 ? (
                    <motion.div
                      key="analysis-changes"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyAnalysisChangesMock />
                      </div>
                    </motion.div>
                  ) : activeAnalysisFeature === 3 ? (
                    <motion.div
                      key="analysis-agenda"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyAnalysisAgendaMock />
                      </div>
                    </motion.div>
                  ) : activeAnalysisFeature === 4 ? (
                    <motion.div
                      key="analysis-price"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                      <div className="h-full w-[108.7%] origin-top-left scale-[0.92]">
                        <CompanyAnalysisPriceMock />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`analysis-feature-${activeAnalysisFeature}`}
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.38, ease: "easeOut" }}
                      className="h-full"
                    >
                  <>
                    {[0, 1, 2, 3, 4].map((featureIndex) => (
                      <div
                        key={featureIndex}
                        className={`features-bg pointer-events-none absolute left-0 top-0 h-full w-full max-w-none transition-opacity duration-500 ${
                          featureIndex === activeAnalysisFeature ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ opacity: featureIndex === activeAnalysisFeature ? 1 : 0 }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.4))]" />
                        <div className="absolute left-0 top-0 grid h-full w-full grid-cols-[48px_120px_1fr]">
                          <div className="flex flex-col items-center gap-4 border-r border-[#eef2f8] py-4">
                            <div className="h-7 w-7 rounded-full bg-[linear-gradient(140deg,#7fe4d6,#0f9f8f)]" />
                            <div className="h-7 w-7 rounded-full border border-[#e4e7eb] bg-white" />
                            <div className="h-7 w-7 rounded-full bg-[radial-gradient(circle,#9df0d8,#0f9f8f)] opacity-80" />
                          </div>
                          <div className="border-r border-[#eef2f8] px-3 py-4 text-[11px] text-[#727272]">
                            <div className="flex items-center gap-2 font-semibold text-[#191919]">
                              <div className="h-5 w-5 rounded-full bg-[#d9d9d9]" />
                              Workspace
                            </div>
                            <div className="mt-7 space-y-3">
                              {["Resumo", "Agenda", "Em espera", "Prontuários", "Estoque", "Conversas", "Documentos"].map(
                                (item, itemIndex) => (
                                  <div key={item} className="flex items-center gap-2">
                                    <span
                                      className={`h-3 w-3 rounded-full border ${
                                        itemIndex === featureIndex
                                          ? "border-[#0f9f8f] bg-[#0f9f8f]"
                                          : "border-[#d6d6d6]"
                                      }`}
                                    />
                                    {item}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                          <div className="px-5 py-4">
                            <div className="text-[14px] font-semibold text-[#1b1b1b]">
                              {["Resumo", "Agenda", "Em espera", "Prontuários", "Estoque"][featureIndex] ?? "Documentos"}
                            </div>
                            <div className="mt-7 h-[230px] rounded-[18px] border border-[#eef2f8] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,247,252,0.9))]" />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pointer-events-none absolute bottom-[-1px] left-[-1px] z-[1] h-[200px] w-[calc(100%+2px)] rounded-b-[20px] bg-gradient-to-t from-white to-transparent" />
                    <div className="pointer-events-none absolute right-[-1px] top-[-1px] z-[1] h-[calc(100%+2px)] w-[200px] rounded-r-[20px] bg-gradient-to-l from-white to-transparent" />

                    <div className="absolute bottom-[17px] right-[17px] z-[2] h-[195px] w-[198px] overflow-hidden rounded-[16px] border-4 border-white shadow-[0px_4px_28px_0px_rgba(0,0,0,0.05)]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_22%,#dff8f3,#7bd8cb_18%,#edf6f4_19%,#edf6f4_60%,#7ba29a_61%,#21433f_100%)]" />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(0,34,75,0) 52%, rgba(0,14,31,0.7) 90%)",
                          backdropFilter: "blur(1.2px)",
                          WebkitBackdropFilter: "blur(1.2px)",
                          maskImage: "linear-gradient(to bottom, transparent 50%, black 85%)",
                          WebkitMaskImage:
                            "linear-gradient(to bottom, transparent 50%, black 85%)",
                        }}
                      />
                      <p
                        className="absolute bottom-4 left-4 w-[166px] text-base font-semibold leading-4 text-white"
                        style={{ textShadow: "0px 1.2px 5px rgba(0,0,0,0.19)" }}
                      >
                        Soluções que acompanham seu crescimento
                      </p>
                    </div>
                  </>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-0">
                <div className="flex h-full w-full items-start gap-4 max-md:h-auto max-md:flex-col">
                  <div className="flex h-[442px] w-[426px] shrink-0 flex-col items-start justify-between overflow-hidden rounded-[20px] border border-[#f0f0f0] bg-white p-8 shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] max-lg:w-[340px] max-md:hidden">
                    <div className="flex w-full flex-col items-start gap-6">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#d4f5e0] to-white">
                        <DollarSign className="h-5 w-5 text-[#49a66d]" />
                      </div>
                      <div className="flex w-full flex-col items-start gap-[9px]">
                        <h3 className="text-[20px] font-semibold leading-7 tracking-[-0.2px] text-[#171717]">
                          Acompanhar
                        </h3>
                        <p className="max-w-[315px] text-lg leading-6 text-[#7a7a7a]">
                          Volte para as empresas certas com prioridade, contexto e atualizações que preservam sua linha de raciocínio.
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full flex-col items-start gap-2">
                      {[
                        "Watchlist organizada",
                        "Atualizações relevantes",
                        "Prioridades do dia",
                        "Alertas com contexto",
                        "Retomada rápida da tese",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex w-full items-center gap-[10px] transition-all duration-300"
                        >
                          <Check className="h-5 w-5 shrink-0 text-[#0f9f8f]" />
                          <span className="text-base font-medium leading-6 text-[#9a9a9a]">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative h-[442px] flex-1 overflow-hidden rounded-[20px] border border-[#f0f0f0] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] max-md:hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#eef8f1_0%,#ffffff_55%,#f5f7fa_100%)]" />
                    <div className="pointer-events-none absolute bottom-[-1px] left-[-1px] z-[1] h-[200px] w-[calc(100%+2px)] rounded-b-[20px] bg-gradient-to-t from-white to-transparent" />
                    <div className="pointer-events-none absolute right-[-1px] top-[-1px] z-[1] h-[calc(100%+2px)] w-[200px] rounded-r-[20px] bg-gradient-to-l from-white to-transparent" />

                    <div className="absolute bottom-[17px] right-[17px] z-[2] h-[195px] w-[198px] overflow-hidden rounded-[16px] border-4 border-white shadow-[0px_4px_28px_0px_rgba(0,0,0,0.05)]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_22%,#dff6e7,#95d9ac_18%,#eef4ef_19%,#eef4ef_60%,#9ab59f_61%,#34483b_100%)]" />
                      <div className="absolute inset-0 rounded-[13px] bg-[linear-gradient(to_bottom,rgba(0,34,75,0)_52%,rgba(0,14,31,0.7)_90%)]" />
                      <p className="absolute bottom-4 left-4 w-[166px] text-base font-semibold leading-4 text-white [text-shadow:0px_1.2px_5px_rgba(0,0,0,0.19)]">
                        Escalar sua clínica nunca foi tão fácil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}

function StepCards() {
  return (
    <div className="flex h-[300px] gap-px overflow-hidden border-y border-[#f0f0f0] bg-[#f0f0f0] max-md:h-auto max-md:flex-col max-md:gap-px max-md:rounded-[16px]">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className={`flex flex-1 flex-col justify-between gap-3 bg-white max-md:!rounded-none max-md:!p-6 ${
            index === 0
              ? "rounded-br-[20px] rounded-tr-[20px] py-6 pr-6"
              : index === 1
                ? "rounded-[20px] p-6"
                : "rounded-bl-[20px] rounded-tl-[20px] p-6"
          }`}
        >
          <div className="flex w-fit items-center rounded-full bg-[#f7f7f7] p-2 backdrop-blur-[16.5px]">
            {index === 0 ? (
              <CalendarDays className="h-6 w-6 text-[#0f9f8f]" />
            ) : index === 1 ? (
              <ClipboardList className="h-6 w-6 text-[#0f9f8f]" />
            ) : (
              <Shield className="h-6 w-6 text-[#0f9f8f]" />
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium leading-[18px] text-[#0f9f8f]">
                {step.label}
              </span>
              <span className="text-[20px] font-semibold leading-7 tracking-[-0.2px] text-[#171717]">
                {step.title}
              </span>
            </div>

            <div className="flex items-center">
              <div className="h-px flex-1 bg-[#f0f0f0]" />
              <svg width="5" height="6" viewBox="0 0 5 6" fill="none" className="shrink-0">
                <path d="M0 0L5 3L0 6V0Z" fill="#f2f2f2" />
              </svg>
            </div>

            <div className="flex flex-col gap-2">
              {step.items.map((item) => (
                <div key={item} className="flex items-center gap-[10px]">
                  <Check className="h-5 w-5 shrink-0 text-[#0f9f8f]" />
                  <span className="text-sm leading-5 text-[#171717]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AIAgentsHero() {
  return (
    <section
      id="allan"
      className="relative overflow-hidden px-20 pb-[80px] max-lg:px-10 max-md:px-6 max-sm:px-0 max-sm:pb-[40px]"
    >
      <div className="relative z-10 flex flex-col items-center gap-6 pt-[64px] max-md:pt-10 max-sm:gap-4 max-sm:px-4">
        <div className="relative h-[88px] w-[88px] overflow-hidden rounded-full max-sm:h-[64px] max-sm:w-[64px]">
          <div className="absolute inset-0 rounded-full bg-white" />
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.95)_0%,rgba(223,246,241,0.85)_30%,rgba(15,159,143,0.22)_62%,rgba(255,255,255,0)_100%)]" />
          <div className="absolute left-1/2 top-1/2 h-[53px] w-[53px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#9bf0de_0%,#0f9f8f_62%,#0c7a6d_100%)] shadow-[0_8px_26px_rgba(15,159,143,0.25)] max-sm:h-[40px] max-sm:w-[40px]" />
          <Sparkles className="absolute left-1/2 top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-white max-sm:h-5 max-sm:w-5" />
        </div>

        <h2
          className="max-w-[620px] bg-clip-text text-center text-[56px] font-semibold leading-[56px] tracking-[-1.12px] text-transparent max-md:text-[36px] max-md:leading-[40px] max-md:tracking-[-0.72px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.56px]"
          style={{
            backgroundImage: "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
          }}
        >
          A mesma empresa, agora muito mais legível.
        </h2>

        <p className="max-w-[474px] text-center text-lg leading-6 text-[#7a7a7a] max-md:text-base max-md:leading-5">
          A Analiso organiza sinais, contexto e mudanças em uma leitura guiada para você entender o que importa sem se perder no ruído.
        </p>

        <button className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#ececec] bg-white px-4 py-[14px] text-sm font-semibold leading-5 text-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:border-[#d9d9d9] hover:ring-2 hover:ring-[#d7f5f0] hover:ring-offset-2 hover:ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#d7f5f0] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] max-sm:h-10 max-sm:px-3 max-sm:py-2.5 max-sm:text-xs">
          Conhecer a Analiso
        </button>
      </div>

      <div className="relative mt-[-40px] max-md:mt-[-20px] max-sm:mt-[-10px]">
        <div className="pointer-events-none absolute bottom-0 top-0 left-1/2 z-0 w-screen -translate-x-1/2">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0%,rgba(255,255,255,0.95)_15%,rgba(159,252,202,0.15)_35%,rgba(159,252,202,0.4)_60%,rgba(159,252,202,1)_100%)]" />
          <div className="absolute left-0 right-0 top-0 z-[5] h-[28%] bg-gradient-to-b from-white to-transparent max-md:h-[130px] max-sm:h-[100px]" />
          <div className="absolute bottom-[-20px] left-0 right-0 z-40 h-[45%] bg-gradient-to-t from-white/80 to-transparent max-md:h-[320px] max-md:from-white max-sm:h-[40%] max-sm:from-white" />
          <div
            className="absolute bottom-0 left-0 right-0 z-[50] h-[30px]"
            style={{
              background:
                "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-1/2 z-[2] h-[220px] w-screen -translate-x-1/2 max-sm:h-[35%]"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
          }}
        />

        <div className="relative z-[1] mx-auto h-[580px] w-full max-w-[1430px] overflow-hidden max-md:h-[400px] max-sm:h-[300px]">
          {[980, 750, 536, 333].map((size) => (
            <div
              key={size}
              className="pointer-events-none absolute left-1/2 top-[33%] -translate-x-1/2 -translate-y-1/2 rounded-full max-md:top-[28%] max-sm:top-[35%]"
              style={{
                width: size,
                height: size,
                opacity: 0.45,
                background:
                  "linear-gradient(to bottom, rgba(159,252,202,0) 0%, rgba(159,252,202,0.35) 100%)",
                border: "2px solid rgba(159,252,202,0.15)",
                boxShadow: "0 4px 12px 0 rgba(0,0,0,0.06)",
              }}
            />
          ))}

          {[1134, 864, 612, 386].map((size, index) => (
            <div
              key={`ring-${size}`}
              className="pointer-events-none absolute left-1/2 top-[33%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 max-md:top-[28%] max-sm:top-[35%]"
              style={{
                width: size,
                height: size,
                opacity: 0.34 - index * 0.05,
              }}
            />
          ))}

          <div className="absolute left-[-10px] top-[241px] z-10 hidden h-[339px] w-[347px] rounded-[160px] bg-[radial-gradient(circle_at_50%_26%,#ebe6df_0%,#ccb29f_14%,#b0e7dc_15%,#f4f4f4_28%,#f4f4f4_100%)] opacity-30 max-sm:!hidden" />
          <div className="absolute left-[211px] top-[59px] z-[35] h-[521px] w-[521px] rounded-full bg-[radial-gradient(circle_at_50%_24%,#ebe6df_0%,#ccb29f_13%,#b0e7dc_14%,#f4f4f4_30%,#f4f4f4_100%)] shadow-[0_20px_40px_rgba(0,0,0,0.08)]" />
          <div className="absolute left-[781px] top-[163px] z-20 h-[417px] w-[427px] rounded-[180px] bg-[radial-gradient(circle_at_50%_26%,#ebe6df_0%,#ccb29f_14%,#f4b8da_15%,#f4f4f4_28%,#f4f4f4_100%)] opacity-30" />
          <div className="absolute left-[1069px] top-[233px] z-10 hidden h-[347px] w-[355px] rounded-[170px] bg-[radial-gradient(circle_at_50%_26%,#ebe6df_0%,#ccb29f_14%,#b0e7dc_15%,#f4f4f4_28%,#f4f4f4_100%)] opacity-30 max-sm:!hidden" />

          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-[45] h-[115px]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>

        <div className="absolute bottom-[33px] left-0 right-0 z-[3] flex flex-col items-center gap-2 max-sm:bottom-[-30px]">
          <div className="flex cursor-pointer items-center gap-3 rounded-full bg-white py-[6px] pl-[6px] pr-3 shadow-[0px_4px_20px_-8px_rgba(88,92,95,0.16)]">
            <div className="relative h-[66px] w-[66px] shrink-0 rounded-full border border-[#f0f0f0] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] max-md:h-[50px] max-md:w-[50px]">
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute bottom-0 left-1/2 h-[66px] w-[54px] -translate-x-1/2 rounded-b-full bg-[radial-gradient(circle_at_50%_24%,#ebe6df_0%,#ccb29f_14%,#b0e7dc_15%,#f4f4f4_28%,#f4f4f4_100%)] max-md:h-[50px] max-md:w-[42px]" />
              </div>
              <span className="absolute bottom-[4px] right-[-2px] z-10 inline-flex h-[14px] w-[22px] items-center justify-center rounded-[6px] bg-[#0f9f8f] text-[9px] font-bold text-white">
                IA
              </span>
            </div>

            <div className="flex h-[56px] items-center rounded-[74px] border border-[#f0f0f0] bg-white px-4 shadow-[0_4px_14px_rgba(0,0,0,0.05)] max-md:h-[44px] max-md:px-3">
              <div className="flex flex-col">
                <span className="text-base font-semibold leading-6 text-[#171717] max-md:text-sm max-md:leading-5">
                  Angelina
                </span>
                <span className="text-xs font-semibold text-[#9a9a9a]">Finanças</span>
              </div>
            </div>
          </div>

          <div className="rounded-[31px] bg-white p-2 shadow-[0px_2px_10px_0px_rgba(88,92,95,0.1)]">
            <div className="h-[3px] w-[27px] overflow-hidden rounded-full bg-[#ececec]">
              <div className="h-full w-full rounded-full bg-[#0f9f8f]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AIWorkCard() {
  return (
    <div className="mx-auto max-w-[690px] rounded-[22px] border border-[#d7f1ec] bg-white shadow-[0_20px_60px_rgba(15,159,143,0.12)]">
      <div className="grid gap-6 p-6 md:grid-cols-[1fr_320px] md:p-8">
        <div>
          <div className="text-[12px] font-semibold text-[#0f9f8f]">
            Allan <span className="rounded-[8px] bg-[#e7fbf7] px-1.5 py-0.5">IA</span>
          </div>
          <h3 className="mt-4 max-w-[250px] text-[22px] font-semibold leading-[1.15] tracking-[-0.04em] text-[#111]">
            Sua anamnese escrita automaticamente.
          </h3>
          <p className="mt-28 max-w-[270px] text-[18px] leading-[1.32] text-[#7b7b7b]">
            Fale durante a consulta. Allan transcreve o atendimento e preenche os campos do prontuário.
          </p>
        </div>
        <div className="relative rounded-[18px] border border-[#e9edf5] bg-[#ffffff] p-4">
          <div className="absolute right-5 top-[-16px] rounded-[18px] border border-[#ececec] bg-white px-5 py-4 shadow-[0_14px_35px_rgba(0,0,0,0.08)]">
            <div className="mb-3 flex items-center gap-4 text-[12px] text-[#8d8d8d]">
              <span className="font-semibold text-[#3b3b3b]">B</span>
              <span>I</span>
              <span>U</span>
              <span className="rounded-full bg-[#f0f2f6] px-2 py-1">Atendimento</span>
            </div>
            <div className="text-[13px] text-[#3a3a3a]">Dor lombar há 3 semanas.</div>
          </div>
          <div className="text-[11px] text-[#97a0ae]">Atendimento</div>
          <div className="mt-10 h-[78px] rounded-[10px] bg-[linear-gradient(90deg,#d8f6f0_0%,#0f9f8f_30%,#0f9f8f_60%,#edf6f4_60%,#edf6f4_100%)]" />
          <div className="mt-4 flex items-center justify-between text-[12px]">
            <span className="font-medium text-[#0f9f8f]">Transcrevendo</span>
            <span className="text-[#d0d5dd]">Escutando</span>
          </div>
        </div>
      </div>
      <div className="rounded-b-[22px] bg-[#ddf6f1] px-6 py-4 text-[14px] font-medium text-[#0f9f8f]">
        Transcrição inteligente
      </div>
    </div>
  );
}

const darkMethodStates = [
  {
    id: "signals",
    label: "Sinais",
    title: "Mostram o que importa primeiro.",
    description:
      "Receita, margem, caixa e qualidade aparecem em ordem, sem afogar você em excesso de indicador.",
    accent: "#24d1bc",
    soft: "rgba(36,209,188,0.18)",
    border: "rgba(36,209,188,0.34)",
    glow:
      "radial-gradient(circle at 50% 30%, rgba(36,209,188,0.28) 0%, rgba(36,209,188,0.12) 26%, rgba(0,0,0,0) 62%)",
  },
  {
    id: "context",
    label: "Contexto",
    title: "Conectam histórico, setor e sequência.",
    description:
      "Os números deixam de ser pontos soltos e passam a fazer sentido juntos.",
    accent: "#6f86ff",
    soft: "rgba(111,134,255,0.18)",
    border: "rgba(111,134,255,0.32)",
    glow:
      "radial-gradient(circle at 50% 30%, rgba(111,134,255,0.26) 0%, rgba(111,134,255,0.1) 26%, rgba(0,0,0,0) 64%)",
  },
  {
    id: "priority",
    label: "Prioridade",
    title: "Priorizam o que mudou sem quebrar a tese.",
    description:
      "Você volta direto ao que pede leitura, sem reabrir toda a análise do zero.",
    accent: "#d6a556",
    soft: "rgba(214,165,86,0.18)",
    border: "rgba(214,165,86,0.32)",
    glow:
      "radial-gradient(circle at 50% 30%, rgba(214,165,86,0.24) 0%, rgba(111,134,255,0.08) 30%, rgba(0,0,0,0) 66%)",
  },
] as const;

function DarkMethodVisual({
  state,
  compact = false,
}: {
  state: (typeof darkMethodStates)[number];
  compact?: boolean;
}) {
  const nucleusWidth = compact ? "w-[340px] max-w-[82%]" : "w-[360px] max-w-[90%]";
  const nucleusPadding = compact ? "p-4" : "p-5";

  return (
    <div className="relative h-full min-h-[250px] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#050505_0%,#0a0a0a_100%)]">
      <div className="absolute inset-0 opacity-[0.16]" style={{ background: state.glow }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-30" />
      <div
        className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: state.border }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[184px] w-[184px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: state.soft }}
      />

      <motion.div
        layout
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm ${nucleusWidth} ${nucleusPadding}`}
      >
        <div className="flex items-center justify-between">
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/78">
            WEGE3 · WEG S.A.
          </div>
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: state.accent, boxShadow: `0 0 18px ${state.accent}` }}
          />
        </div>

        <div className="mt-4 grid gap-3 grid-cols-3">
          <div className="rounded-[16px] border border-white/8 bg-white/5 px-3 py-3">
            <div className="h-[7px] w-[46px] rounded-full bg-white/15" />
            <div className="mt-3 h-[30px] rounded-[10px] bg-white/8" />
          </div>
          <div
            className="rounded-[16px] border px-3 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            style={{ borderColor: state.border, backgroundColor: state.soft }}
          >
            <div className="h-[7px] w-[52px] rounded-full bg-white/45" />
            <div className="mt-3 h-[34px] rounded-[10px] bg-white/30" />
          </div>
          <div className="rounded-[16px] border border-white/8 bg-white/5 px-3 py-3">
            <div className="h-[7px] w-[42px] rounded-full bg-white/15" />
            <div className="mt-3 h-[30px] rounded-[10px] bg-white/8" />
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-white/8 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="h-[8px] w-[116px] rounded-full bg-white/18" />
            <div className="h-[8px] w-[52px] rounded-full bg-white/10" />
          </div>
          <div className="mt-4 h-[2px] rounded-full bg-white/8" />
          <div className="mt-4 flex items-end gap-2">
            <div className="h-[44px] flex-1 rounded-[10px] bg-white/7" />
            <div
              className="h-[58px] flex-1 rounded-[10px]"
              style={{ backgroundColor: state.soft, boxShadow: `inset 0 0 0 1px ${state.border}` }}
            />
            <div className="h-[38px] flex-1 rounded-[10px] bg-white/7" />
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {state.id === "signals" ? (
          <motion.div
            key="signals"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div
              className="absolute left-[12%] top-[18%] h-[76px] w-[96px] rounded-[18px] border shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
              style={{ borderColor: state.border, backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="px-4 pt-4">
                <div className="h-[7px] w-[44px] rounded-full bg-white/20" />
                <div className="mt-3 h-[22px] rounded-[9px] bg-white/12" />
              </div>
            </div>
            <div
              className="absolute right-[10%] top-[24%] h-[68px] w-[88px] rounded-[18px] border"
              style={{ borderColor: state.border, backgroundColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="px-4 pt-4">
                <div className="h-[7px] w-[38px] rounded-full bg-white/20" />
                <div className="mt-3 h-[18px] rounded-[9px] bg-white/10" />
              </div>
            </div>
            <div
              className="absolute bottom-[14%] right-[18%] h-[72px] w-[104px] rounded-[18px] border"
              style={{ borderColor: state.border, backgroundColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="px-4 pt-4">
                <div className="h-[7px] w-[48px] rounded-full bg-white/20" />
                <div className="mt-3 h-[22px] rounded-[9px] bg-white/10" />
              </div>
            </div>
          </motion.div>
        ) : state.id === "context" ? (
          <motion.div
            key="context"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 560" preserveAspectRatio="none">
              <path d="M210 360C320 240 400 230 500 280" stroke={state.accent} strokeOpacity="0.55" strokeWidth="2" fill="none" />
              <path d="M500 280C600 320 670 280 770 180" stroke={state.accent} strokeOpacity="0.55" strokeWidth="2" fill="none" />
              <path d="M240 170C340 120 430 140 500 220" stroke="#9db0ff" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
            </svg>
            <div className="absolute left-[14%] top-[32%] h-3 w-3 rounded-full" style={{ backgroundColor: state.accent, boxShadow: `0 0 16px ${state.accent}` }} />
            <div className="absolute left-[47.5%] top-[49%] h-3 w-3 rounded-full" style={{ backgroundColor: state.accent, boxShadow: `0 0 16px ${state.accent}` }} />
            <div className="absolute right-[16%] top-[28%] h-3 w-3 rounded-full" style={{ backgroundColor: state.accent, boxShadow: `0 0 16px ${state.accent}` }} />
            <div className="absolute right-[12%] bottom-[18%] rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] font-medium text-white/75">
              Acima do setor
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="priority"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div
              className="absolute right-[10%] top-[19%] w-[158px] rounded-[18px] border px-4 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
              style={{ borderColor: state.border, backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: state.accent }} />
                <div className="h-[7px] w-[68px] rounded-full bg-white/24" />
              </div>
              <div className="mt-3 h-[8px] w-[112px] rounded-full bg-white/16" />
              <div className="mt-2 h-[8px] w-[88px] rounded-full bg-white/10" />
            </div>
            <div className="absolute left-[11%] top-[26%] w-[118px] rounded-[16px] border border-white/10 bg-white/6 px-4 py-3">
              <div className="h-[7px] w-[42px] rounded-full bg-white/16" />
              <div className="mt-3 h-[16px] rounded-[8px] bg-white/10" />
            </div>
            <div className="absolute bottom-[15%] right-[17%] w-[126px] rounded-[16px] border border-white/10 bg-white/6 px-4 py-3">
              <div className="h-[7px] w-[48px] rounded-full bg-white/16" />
              <div className="mt-3 h-[16px] rounded-[8px] bg-white/10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DarkMethodPhotoPanel({
  state,
}: {
  state: (typeof darkMethodStates)[number];
}) {
  return (
    <div className="cap-photo absolute inset-0 bg-black transition-opacity duration-500">
      <div className="absolute inset-0">
        <div
          className="absolute left-1/2 top-[10px] h-[365px] w-[365px] -translate-x-1/2 rounded-full opacity-90"
          style={{ background: state.glow, filter: "blur(18px)" }}
        />

        <div className="absolute left-1/2 top-[34px] h-[312px] w-[312px] -translate-x-1/2 rounded-full border border-white/10" />
        <div
          className="absolute left-1/2 top-[63px] h-[254px] w-[254px] -translate-x-1/2 rounded-full border"
          style={{ borderColor: state.border }}
        />

        <div className="absolute left-1/2 top-[98px] w-[260px] -translate-x-1/2 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/78">
              WEGE3 · WEG S.A.
            </div>
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: state.accent, boxShadow: `0 0 18px ${state.accent}` }}
            />
          </div>

          {state.id === "signals" ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="rounded-[16px] border px-3 py-3"
                  style={
                    idx === 1
                      ? {
                          borderColor: state.border,
                          backgroundColor: state.soft,
                          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        }
                      : { borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.05)" }
                  }
                >
                  <div className={`h-[7px] rounded-full ${idx === 1 ? "bg-white/45" : "bg-white/15"} ${idx === 0 ? "w-[46px]" : idx === 1 ? "w-[52px]" : "w-[42px]"}`} />
                  <div className={`mt-3 rounded-[10px] ${idx === 1 ? "h-[34px] bg-white/30" : "h-[30px] bg-white/8"}`} />
                </div>
              ))}
            </div>
          ) : state.id === "context" ? (
            <div className="mt-4 rounded-[18px] border border-white/8 bg-white/5 p-4">
              <svg className="h-[76px] w-full" viewBox="0 0 220 76" preserveAspectRatio="none">
                <path d="M12 55C52 22 90 18 118 38C144 56 174 46 208 16" stroke={state.accent} strokeOpacity="0.8" strokeWidth="2" fill="none" />
                <path d="M22 22C64 10 96 18 118 34" stroke="#9db0ff" strokeOpacity="0.45" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="55" r="3" fill={state.accent} />
                <circle cx="118" cy="38" r="3" fill={state.accent} />
                <circle cx="208" cy="16" r="3" fill={state.accent} />
              </svg>
              <div className="mt-3 flex items-center justify-between">
                <div className="h-[8px] w-[94px] rounded-full bg-white/16" />
                <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-medium text-white/70">
                  Acima do setor
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div
                className="ml-auto w-[156px] rounded-[18px] border px-4 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
                style={{ borderColor: state.border, backgroundColor: "rgba(255,255,255,0.10)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: state.accent }} />
                  <div className="h-[7px] w-[68px] rounded-full bg-white/24" />
                </div>
                <div className="mt-3 h-[8px] w-[112px] rounded-full bg-white/16" />
                <div className="mt-2 h-[8px] w-[88px] rounded-full bg-white/10" />
              </div>
              <div className="flex gap-3">
                <div className="w-[112px] rounded-[16px] border border-white/10 bg-white/6 px-4 py-3">
                  <div className="h-[7px] w-[42px] rounded-full bg-white/16" />
                  <div className="mt-3 h-[16px] rounded-[8px] bg-white/10" />
                </div>
                <div className="w-[124px] rounded-[16px] border border-white/10 bg-white/6 px-4 py-3">
                  <div className="h-[7px] w-[48px] rounded-full bg-white/16" />
                  <div className="mt-3 h-[16px] rounded-[8px] bg-white/10" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute left-0 top-0 h-20 w-full bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 h-[137px] w-full bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-0 left-0 top-0 w-[151px] bg-gradient-to-r from-black to-transparent" />
        <div className="absolute bottom-0 right-0 top-0 w-[109px] bg-gradient-to-l from-black to-transparent" />
      </div>
    </div>
  );
}

function CapabilityGlyph({
  type,
  active,
  accent,
}: {
  type: "signals" | "context" | "priority";
  active: boolean;
  accent: string;
}) {
  const color = active ? accent : "rgba(255,255,255,0.5)";
  const muted = active ? `${accent}22` : "rgba(255,255,255,0.08)";

  if (type === "signals") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3.25" y="8.75" width="5.25" height="5.25" rx="2.625" fill={color} opacity={active ? 0.72 : 1} />
        <rect x="7.7" y="6.2" width="8.1" height="7.6" rx="3.8" fill={color} />
        <rect x="12.1" y="8.55" width="4.65" height="4.65" rx="2.325" fill={muted} />
      </svg>
    );
  }

  if (type === "context") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M6.1 11.9L9.45 8.65L13.7 11"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={active ? 0.9 : 0.75}
        />
        <circle cx="5.35" cy="12.65" r="2.1" fill={color} />
        <circle cx="10" cy="8" r="2.35" fill={active ? color : "rgba(255,255,255,0.58)"} />
        <circle cx="14.7" cy="11.75" r="2.1" fill={muted} stroke={color} strokeWidth="1.1" />
      </svg>
    );
  }

  return (
    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.2" stroke={color} strokeWidth="1.4" opacity={active ? 0.9 : 0.65} />
      <circle cx="10" cy="10" r="3.65" fill={muted} stroke={color} strokeWidth="1.1" />
      <circle cx="10" cy="10" r="1.7" fill={color} />
    </svg>
  );
}

function DarkCapabilitiesOld() {
  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto overflow-hidden rounded-[34px] bg-[radial-gradient(circle_at_top,#181818_0%,#030303_55%,#000000_100%)] px-6 py-16 md:px-10 md:py-20">
        <SectionHeading
          badge="Método"
          title={
            <>
              Leituras que observam,
              <br />
              conectam e priorizam.
            </>
          }
          description="A Analiso transforma sinais espalhados em uma lógica contínua de leitura: o que importa, por que importa e o que merece acompanhamento."
          dark
        />
        <div className="mx-auto mt-14 max-w-[1040px] overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_50%_42%,rgba(79,122,255,0.24),transparent_24%),linear-gradient(180deg,#040404,#070707)]">
          <div className="h-[430px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.02)_28%,transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
        </div>
        <div className="mx-auto mt-16 max-w-[1040px]">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <h3 className="max-w-[420px] text-[40px] font-semibold leading-[42px] tracking-[-0.8px] text-white max-md:text-[28px] max-md:leading-[32px] max-md:tracking-[-0.56px]">
              IA que trabalha junto
              <br />
              com sua clínica.
            </h3>
            <p className="max-w-[339px] pl-[14px] text-base leading-6 text-[#999] md:justify-self-end">
              Assistentes que acompanham a operação da clínica, analisam dados e executam tarefas automaticamente.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-[426px_1fr]">
            <div className="relative rounded-[24px] border border-[#1a1a1a] bg-black p-8">
              <div className="text-sm leading-5 text-[#808080]">Capacidades</div>
              <div className="mt-10 space-y-5 text-xl font-semibold">
                {[
                  { label: "Percepção", active: false },
                  { label: "Áudio e contexto", active: false },
                  { label: "Inteligência", active: true },
                ].map(({ label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-4 ${active ? "text-white opacity-100" : "text-white opacity-70"}`}
                  >
                    <span
                      className={`flex h-[58px] w-[58px] items-center justify-center rounded-full border-2 ${
                        active ? "border-[#0E7AFF] text-white" : "border-transparent text-white"
                      }`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#031833]">
                        <Bot className="h-4 w-4" />
                      </span>
                    </span>
                    {label}
                  </div>
                ))}
              </div>
              <div className="assistants-card-glow absolute -top-px left-0 right-0 z-30 h-16 rounded-3xl opacity-40 blur-[78.8px] pointer-events-none" />
            </div>
            <div className="relative rounded-[24px] border border-[#1a1a1a] bg-black p-6">
              <div className="grid h-full gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div className="min-h-[250px] rounded-[18px] bg-[radial-gradient(circle_at_50%_30%,rgba(0,103,230,0.5)_0%,rgba(0,103,230,0)_42%),linear-gradient(180deg,#050505,#0b0b0b)]" />
                <div className="self-end pb-4">
                  <div className="text-xs font-medium leading-[18px] text-[#3E95FF]">Inteligência</div>
                  <div className="mt-4 text-[18px] font-semibold text-white md:text-[24px]">
                    Pensam com você
                  </div>
                  <p className="mt-4 w-[280px] max-w-full text-sm leading-5 text-[#999]">
                    Analisam dados e geram relatórios, alertas e automações úteis.
                  </p>
                </div>
              </div>
              <div className="assistants-card-glow absolute -top-px left-0 right-0 z-30 h-16 rounded-3xl opacity-40 blur-[78.8px] pointer-events-none" />
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Privacidade total dos dados",
                text: "Os dados da clínica permanecem protegidos dentro da plataforma.",
                icon: Shield,
              },
              {
                title: "Pensar, refletir e agir",
                text: "Os assistentes analisam dados da clínica e executam ações automaticamente.",
                icon: Sparkles,
              },
              {
                title: "Execução automática",
                text: "Assistentes executam tarefas da clínica automaticamente.",
                icon: Bot,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-[#1a1a1a] bg-[linear-gradient(180deg,#0e0e0e,#090909)] p-6"
              >
                <div className="mb-24 flex h-16 w-16 items-center justify-center rounded-full border border-[#145f56] bg-[radial-gradient(circle,#083c36,#071221)] text-[#0f9f8f]">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="text-[18px] font-semibold text-white md:text-[20px]">
                  {item.title}
                </div>
                <p className="mt-4 text-[16px] leading-[1.5] text-[#8f8f8f]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

void DarkCapabilitiesOld;

function DarkCapabilitiesLegacyCurrent() {
  const reducedMotion = useReducedMotion();
  const [activeMethod, setActiveMethod] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentMethod = darkMethodStates[activeMethod];

  useEffect(() => {
    if (reducedMotion || isPaused) return;

    const interval = window.setInterval(() => {
      setActiveMethod((current) => (current + 1) % darkMethodStates.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [isPaused, reducedMotion]);

  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto overflow-hidden rounded-[34px] bg-[radial-gradient(circle_at_top,#181818_0%,#030303_55%,#000000_100%)] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto mb-14 h-px max-w-[1040px] bg-[#171717]" />
        <SectionHeading
          badge="Método"
          title={
            <>
              Leituras que observam,
              <br />
              conectam e priorizam.
            </>
          }
          description="A Analiso transforma sinais espalhados em uma lógica contínua de leitura: o que importa, por que importa e o que merece acompanhamento."
          dark
        />

        <div className="mx-auto mt-14 max-w-[1040px] overflow-hidden rounded-[26px] border border-[#171717] bg-[linear-gradient(180deg,#040404,#070707)]">
          <div className="h-[430px]">
            <DarkMethodVisual state={currentMethod} compact />
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-[1040px]">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <h3 className="max-w-[420px] text-[40px] font-semibold leading-[42px] tracking-[-0.8px] text-white max-md:text-[28px] max-md:leading-[32px] max-md:tracking-[-0.56px]">
              Método que lê a empresa
              <br />
              em continuidade.
            </h3>
            <p className="max-w-[339px] pl-[14px] text-base leading-6 text-[#999] md:justify-self-end">
              Sinais, contexto e prioridade entram em cena sem quebrar a linha de raciocínio da análise.
            </p>
          </div>

          <div
            className="mt-10 grid gap-4 lg:grid-cols-[426px_1fr]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative flex w-[426px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-[#1a1a1a] bg-black p-8 max-md:h-auto max-md:w-full max-md:gap-8">
              <p className="text-sm leading-5 text-[#808080]">Capacidades</p>
              <div className="relative flex flex-col gap-1">
                {darkMethodStates.map((item, index) => {
                  const active = index === activeMethod;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveMethod(index)}
                      className={`flex w-full items-center gap-4 text-left transition-all duration-300 ${
                        active ? "text-white opacity-100" : "text-white opacity-70 hover:opacity-90"
                      }`}
                    >
                      <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center">
                        <svg
                          className={`absolute inset-0 -rotate-90 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}
                          width="58"
                          height="58"
                          viewBox="0 0 58 58"
                          fill="none"
                        >
                          <circle
                            cx="29"
                            cy="29"
                            r="26"
                            stroke="#0E7AFF"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray="163.36"
                            strokeDashoffset={active ? 0 : 163.36}
                            style={{ transition: active && !reducedMotion ? "stroke-dashoffset 5200ms linear" : "none" }}
                          />
                        </svg>
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#031833] ${active ? "" : "opacity-80"}`}>
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: active ? item.accent : "#8aa3c7" }}
                          />
                        </span>
                      </span>
                      <span className="text-xl font-semibold leading-7 tracking-[-0.2px] text-white">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="assistants-card-glow absolute -top-px left-0 right-0 z-30 h-16 rounded-3xl opacity-40 blur-[78.8px] pointer-events-none max-md:opacity-20" />
            </div>

            <div className="relative flex flex-1 overflow-hidden rounded-3xl border border-[#1a1a1a] bg-black max-md:flex-col">
              <div className="relative w-[427px] shrink-0 overflow-hidden bg-black max-md:h-[280px] max-md:w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentMethod.id}-photo`}
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <DarkMethodPhotoPanel state={currentMethod} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-[302px] top-0 z-10 hidden w-[250px] bg-[linear-gradient(to_right,transparent_0%,rgba(0,0,0,1)_50%,transparent_100%)] md:block" />
              <div className="relative z-20 flex flex-1 max-md:min-h-[170px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentMethod.id}-text`}
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="cap-text absolute inset-0 flex flex-col gap-4 justify-end pb-10 pl-[14px] pr-8 max-md:px-6 max-md:py-5 max-md:justify-start max-sm:items-center max-sm:text-center"
                  >
                    <span
                      className="cap-text-item text-xs font-medium leading-[18px] text-[#3E95FF]"
                      style={{ ["--text-delay" as string]: 0 }}
                    >
                      {currentMethod.label}
                    </span>
                    <h4
                      className="cap-text-item text-2xl max-sm:text-[20px] font-semibold leading-7 max-sm:leading-6 tracking-[-0.24px] text-white max-md:max-w-full"
                      style={{ ["--text-delay" as string]: 1 }}
                    >
                      {currentMethod.title}
                    </h4>
                    <p
                      className="cap-text-item w-[280px] max-md:w-full text-sm leading-5 text-[#999]"
                      style={{ ["--text-delay" as string]: 2 }}
                    >
                      {currentMethod.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="assistants-card-glow absolute -top-px left-0 right-0 z-30 h-16 rounded-3xl opacity-40 blur-[78.8px] pointer-events-none max-md:opacity-20" />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Menos ruído visual",
                text: "A leitura começa pelo que realmente importa.",
              },
              {
                title: "Contexto verificável",
                text: "Histórico e comparação ajudam a confirmar a leitura.",
              },
              {
                title: "Acompanhamento contínuo",
                text: "O que mudou ganha prioridade sem desmontar o raciocínio.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-[#1a1a1a] bg-[linear-gradient(180deg,#0e0e0e,#090909)] p-6"
              >
                <div className="mb-24 h-16 w-16 rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
                  <div className="flex h-full items-end gap-1.5">
                    <div className="h-[40%] w-full rounded-full bg-white/12" />
                    <div className="h-[70%] w-full rounded-full bg-white/18" />
                    <div className="h-[54%] w-full rounded-full bg-white/12" />
                  </div>
                </div>
                <div className="text-[18px] font-semibold text-white md:text-[20px]">
                  {item.title}
                </div>
                <p className="mt-4 text-[16px] leading-[1.5] text-[#8f8f8f]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DarkCapabilities() {
  const capabilityAccent = "#0f9f8f";
  const reducedMotion = useReducedMotion();
  const [activeMethod, setActiveMethod] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredSupportCard, setHoveredSupportCard] = useState<number | null>(null);
  const currentMethod = darkMethodStates[activeMethod];

  useEffect(() => {
    if (reducedMotion || isPaused) return;

    const interval = window.setInterval(() => {
      setActiveMethod((current) => (current + 1) % darkMethodStates.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, reducedMotion]);

  return (
    <section
      id="assistentes"
      className="relative w-full overflow-clip rounded-[20px] bg-black pb-[80px] pt-[100px] max-md:pb-12 max-md:pt-16 max-sm:rounded-none max-sm:px-4"
    >
      <div className="mx-auto max-w-[1430px]">
        <div className="flex flex-col items-center gap-6 max-lg:px-20 max-md:px-8 max-sm:px-4">
          <div className="flex items-center justify-center rounded-lg bg-[#0b2b26] px-2 py-1">
            <span className="text-xs font-semibold leading-[18px] text-[#58d6c6]">Método</span>
          </div>
          <h2 className="assistants-heading text-center text-[56px] font-semibold leading-[62px] tracking-[-1.12px] text-white max-md:text-[36px] max-md:leading-[40px] max-md:tracking-[-0.72px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.56px]">
            Leituras que observam,
            <br />
            conectam e priorizam.
          </h2>
          <p className="max-w-[558px] text-center text-lg leading-6 text-[#999]">
            A Analiso transforma sinais espalhados em uma lógica contínua de leitura: o que importa, por que importa e o que merece acompanhamento.
          </p>
        </div>

        <div className="relative mt-[60px] max-md:hidden">
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-[180px]"
            style={{ background: "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.6) 40%, transparent 100%)" }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-[302px]"
            style={{ background: "linear-gradient(to right, black 0%, rgba(0,0,0,0.8) 60%, transparent 100%)" }}
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-20 w-[302px]"
            style={{ background: "linear-gradient(to left, black 0%, rgba(0,0,0,0.8) 60%, transparent 100%)" }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[230px]"
            style={{ background: "linear-gradient(to top, black 0%, rgba(0,0,0,0.6) 50%, transparent 100%)" }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[230px]"
            style={{ background: "linear-gradient(to top, black 0%, transparent 60%)" }}
          />
          <div className="relative mx-[70px] h-[711px] overflow-hidden rounded-[20px] max-lg:mx-8" id="assistants-video-wrap">
            <DarkMethodVisual state={currentMethod} compact />
          </div>
        </div>

        <div className="mx-[60px] mt-[80px] h-px bg-[#1a1a1a] max-md:mx-4 max-md:mt-12 max-md:bg-transparent max-sm:mx-2 max-sm:hidden" />

        <div className="mx-[60px] mt-[80px] flex items-start gap-4 max-md:mx-4 max-md:mt-12 max-md:flex-col max-md:gap-6 max-sm:mx-2 max-sm:hidden">
          <div className="w-[426px] shrink-0 max-md:w-full">
            <h3 className="max-w-[420px] text-[40px] font-semibold leading-[42px] tracking-[-0.8px] text-white max-md:text-[28px] max-md:leading-[32px] max-md:tracking-[-0.56px]">
              Método que lê a empresa
              <br />
              em continuidade.
            </h3>
          </div>
          <div className="flex flex-1 max-md:block">
            <div className="w-[422px] shrink-0 max-md:hidden" />
            <p className="max-w-[339px] pl-[14px] text-base leading-6 text-[#999] max-md:max-w-full max-md:pl-6 max-md:text-left">
              Sinais, contexto e prioridade entram em cena sem quebrar a linha de raciocínio da análise.
            </p>
          </div>
        </div>

        <div
          className="mx-0 mt-[10px] h-[230px] max-md:h-[100px] max-sm:hidden"
          style={{ background: "linear-gradient(to bottom, transparent, black 80%)" }}
        />

        <div
          className="relative mx-[60px] -mt-[140px] flex flex-col gap-4 max-md:mx-4 max-md:-mt-[80px] max-sm:mx-0 max-sm:mt-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative flex gap-4 max-md:flex-col" id="cap-row">
            <div
              className="relative flex w-[426px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-[#1a1a1a] bg-black p-8 max-md:!h-auto max-md:w-full max-md:gap-8"
              style={{ height: 385 }}
            >
              <p className="text-sm leading-5 text-[#808080]">Capacidades</p>
              <div className="relative flex flex-col gap-1">
                {darkMethodStates.map((item, index) => {
                  const active = index === activeMethod;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveMethod(index)}
                      className="cap-item flex cursor-pointer items-center gap-4 text-left"
                      data-cap-index={index}
                      style={{ opacity: active ? 1 : 0.7 }}
                    >
                      <div className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center">
                        <svg
                          className={`cap-ring absolute inset-0 -rotate-90 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}
                          width="58"
                          height="58"
                          viewBox="0 0 58 58"
                          fill="none"
                          data-ring-index={index}
                        >
                          <circle
                            cx="29"
                            cy="29"
                            r="26"
                            stroke={capabilityAccent}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray="163.36"
                            strokeDashoffset={active ? 0 : 163.36}
                            style={{ transition: active && !reducedMotion ? "stroke-dashoffset 5000ms linear" : "none" }}
                          />
                        </svg>
                        <div
                          className={`cap-icon-wrap flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${active ? "" : "inactive"}`}
                          data-cap-icon={index}
                          style={{
                            background: active
                              ? "radial-gradient(circle at 35% 30%, rgba(27, 214, 191, 0.4) 0%, rgba(15, 159, 143, 0.24) 45%, rgba(6, 28, 25, 0.96) 100%)"
                              : "rgba(255,255,255,0.08)",
                          }}
                        >
                          <CapabilityGlyph
                            type={item.id}
                            active={active}
                            accent={capabilityAccent}
                          />
                        </div>
                      </div>
                      <span className="text-xl font-semibold leading-7 tracking-[-0.2px] text-white">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="assistants-card-glow pointer-events-none absolute -top-px left-0 right-0 z-30 h-16 rounded-3xl opacity-40 blur-[78.8px] max-md:opacity-20" />
            </div>

            <div
              className="relative flex flex-1 overflow-hidden rounded-3xl border border-[#1a1a1a] bg-black max-md:!h-auto max-md:flex-col"
              style={{ height: 385 }}
            >
              <div className="relative w-[427px] shrink-0 overflow-hidden bg-black max-md:h-[280px] max-md:w-full">
                <div className="absolute inset-0 max-md:inset-auto max-md:left-1/2 max-md:top-0 max-md:h-[385px] max-md:w-[427px] max-md:-translate-x-1/2 max-md:scale-[0.75] max-md:origin-top">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentMethod.id}-photo`}
                      initial={reducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <DarkMethodPhotoPanel state={currentMethod} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="pointer-events-none absolute inset-0 z-10">
                  <div className="absolute left-0 top-0 h-20 w-full bg-gradient-to-b from-black to-transparent max-md:h-[58px]" />
                  <div className="absolute bottom-0 left-0 h-[137px] w-full bg-gradient-to-t from-black to-transparent max-md:h-[100px]" />
                  <div className="absolute bottom-0 left-0 top-0 w-[151px] bg-gradient-to-r from-black to-transparent max-md:w-[120px]" />
                  <div className="absolute bottom-0 right-0 top-0 w-[109px] bg-gradient-to-l from-black to-transparent max-md:w-[85px]" />
                </div>
              </div>

              <div
                className="cap-fade-right-overflow pointer-events-none absolute bottom-0 left-[302px] top-0 z-10 hidden w-[250px] max-md:hidden"
                style={{ background: "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 50%, transparent 100%)" }}
              />

              <div
                className="pointer-events-none absolute left-0 right-0 z-20 hidden h-[80px] max-md:block"
                style={{ top: 280, background: "linear-gradient(to bottom, black, transparent)" }}
              />

              <div className="relative z-20 flex flex-1 max-md:min-h-[170px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentMethod.id}-text`}
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="cap-text absolute inset-0 flex flex-col gap-4 justify-end pb-10 pl-[14px] pr-8 max-md:px-6 max-md:py-5 max-md:justify-start max-sm:items-center max-sm:text-center"
                    data-cap-text={activeMethod}
                  >
                    <span className="cap-text-item text-xs font-medium leading-[18px] text-[#0f9f8f]" style={{ ["--text-delay" as string]: 0 }}>
                      {currentMethod.label}
                    </span>
                    <h4
                      className="cap-text-item text-2xl font-semibold leading-7 tracking-[-0.24px] text-white max-md:max-w-full max-sm:text-[20px] max-sm:leading-6"
                      style={{ ["--text-delay" as string]: 1 }}
                    >
                      {currentMethod.title}
                    </h4>
                    <p
                      className="cap-text-item w-[280px] text-sm leading-5 text-[#999] max-md:w-full"
                      style={{ ["--text-delay" as string]: 2 }}
                    >
                      {currentMethod.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="assistants-card-glow pointer-events-none absolute -top-px left-0 right-0 z-30 h-16 rounded-3xl opacity-40 blur-[78.8px] max-md:opacity-20" />
            </div>
          </div>

          <motion.div
            className="relative flex gap-4 max-md:flex-col"
            initial={reducedMotion ? false : "hidden"}
            whileInView={reducedMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.35 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
          >
            {[
              {
                key: "noise",
                title: "Menos ruído visual",
                text: "A leitura começa pelo que realmente importa.",
              },
              {
                key: "context",
                title: "Contexto verificável",
                text: "Histórico e comparação ajudam a confirmar a leitura.",
              },
              {
                key: "priority",
                title: "Acompanhamento contínuo",
                text: "O que mudou ganha prioridade sem desmontar o raciocínio.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="relative flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden rounded-3xl border border-[#1a1a1a] px-14 py-10 max-md:!h-auto"
                style={{ height: 455 }}
                onHoverStart={() => setHoveredSupportCard(index)}
                onHoverEnd={() => setHoveredSupportCard((current) => (current === index ? null : current))}
                variants={
                  reducedMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, y: 28 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                        },
                      }
                }
              >
                {item.key === "noise" ? (
                  <div className="relative h-[243px] w-[317px] shrink-0 overflow-hidden rounded-[20px]">
                    <motion.div
                      className="absolute left-[14px] top-4 h-[212px] w-[288px] rounded-[20px] border border-white/6"
                      style={{ background: "radial-gradient(circle at top, rgba(61,184,167,0.18), transparent 55%)" }}
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              opacity: [0.8, 1, 0.8],
                              scale: [1, 1.03, 1],
                            }
                      }
                      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute left-1/2 top-[92px] h-[124px] w-[108px] -translate-x-1/2 rounded-[26px] bg-[radial-gradient(circle,rgba(61,184,167,0.24)_0%,rgba(61,184,167,0.08)_48%,transparent_78%)]"
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              opacity: hoveredSupportCard === index ? 0.9 : [0.5, 0.85, 0.5],
                              scale: hoveredSupportCard === index ? 1.06 : [0.96, 1.04, 0.96],
                            }
                      }
                      transition={
                        reducedMotion
                          ? undefined
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                    <motion.div
                      className="absolute left-[56px] top-[88px] h-[2px] w-[94px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={reducedMotion ? false : { opacity: 0 }}
                      whileInView={reducedMotion ? undefined : { opacity: 1 }}
                      transition={
                        reducedMotion
                          ? { duration: 0.55, delay: 0.18, ease: "easeOut" }
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : { duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.18 }
                      }
                      animate={
                        reducedMotion
                          ? undefined
                          : { opacity: hoveredSupportCard === index ? 0.08 : [0.1, 0.24, 0.1] }
                      }
                    />
                    <motion.div
                      className="absolute right-[56px] top-[88px] h-[2px] w-[94px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={reducedMotion ? false : { opacity: 0 }}
                      whileInView={reducedMotion ? undefined : { opacity: 1 }}
                      transition={
                        reducedMotion
                          ? { duration: 0.55, delay: 0.24, ease: "easeOut" }
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : { duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.24 }
                      }
                      animate={
                        reducedMotion
                          ? undefined
                          : { opacity: hoveredSupportCard === index ? 0.08 : [0.1, 0.24, 0.1] }
                      }
                    />
                    <motion.div
                      className="absolute left-[84px] top-[126px] h-[72px] w-[62px] rounded-[18px] border border-white/10 bg-white/5"
                      animate={reducedMotion ? undefined : { opacity: hoveredSupportCard === index ? 0.14 : [0.22, 0.4, 0.22], scale: hoveredSupportCard === index ? 0.97 : [1, 0.985, 1] }}
                      transition={
                        reducedMotion
                          ? undefined
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                    <motion.div
                      className="absolute right-[84px] top-[136px] h-[62px] w-[62px] rounded-[18px] border border-white/10 bg-white/5"
                      animate={reducedMotion ? undefined : { opacity: hoveredSupportCard === index ? 0.14 : [0.22, 0.38, 0.22], scale: hoveredSupportCard === index ? 0.97 : [1, 0.985, 1] }}
                      transition={
                        reducedMotion
                          ? undefined
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : { duration: 5.1, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                    <motion.div
                      className="absolute left-1/2 top-[106px] h-[108px] w-[72px] -translate-x-1/2 rounded-[18px] border border-[#3db8a7]/40 bg-[rgba(61,184,167,0.12)]"
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
                      whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              scale: hoveredSupportCard === index ? 1.05 : [0.98, 1.04, 0.98],
                              opacity: hoveredSupportCard === index ? 1 : [0.92, 1, 0.92],
                              boxShadow:
                                hoveredSupportCard === index
                                  ? "0 16px 42px rgba(11, 143, 127, 0.22)"
                                  : [
                                      "0 10px 28px rgba(11, 143, 127, 0.12)",
                                      "0 16px 36px rgba(11, 143, 127, 0.2)",
                                      "0 10px 28px rgba(11, 143, 127, 0.12)",
                                    ],
                            }
                      }
                      transition={{
                        opacity: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: hoveredSupportCard === index ? 0.2 : 4.8, repeat: hoveredSupportCard === index ? 0 : Infinity, ease: "easeInOut" },
                        boxShadow: { duration: hoveredSupportCard === index ? 0.2 : 4.8, repeat: hoveredSupportCard === index ? 0 : Infinity, ease: "easeInOut" },
                      }}
                    />
                    <div className="absolute left-0 top-0 h-[95px] w-full bg-gradient-to-b from-black to-transparent" />
                    <div className="absolute bottom-0 left-0 h-[95px] w-full bg-gradient-to-t from-black to-transparent" />
                  </div>
                ) : item.key === "context" ? (
                  <div className="relative h-[243px] w-[317px] shrink-0 overflow-hidden rounded-[20px]">
                    <div className="absolute left-[14px] top-4 h-[212px] w-[288px] rounded-[20px] border border-white/6 bg-[radial-gradient(circle_at_top,rgba(116,131,255,0.18),transparent_55%)]" />
                    <svg className="absolute left-[42px] top-[52px] h-[138px] w-[232px]" viewBox="0 0 232 138" fill="none">
                      <motion.path
                        d="M8 112C54 76 92 62 120 74C150 86 182 72 224 28"
                        stroke="#7b8cff"
                        strokeOpacity={hoveredSupportCard === index ? 0.92 : 0.7}
                        strokeWidth="2"
                        initial={reducedMotion ? false : { pathLength: 0, opacity: 0.25 }}
                        whileInView={reducedMotion ? undefined : { pathLength: 1, opacity: 1 }}
                        animate={
                          reducedMotion
                            ? undefined
                            : {
                                pathLength: 1,
                                opacity: hoveredSupportCard === index ? 1 : 0.92,
                              }
                        }
                        transition={{ duration: 1.1, ease: "easeInOut" }}
                      />
                      {!reducedMotion ? (
                        <motion.path
                          d="M8 112C54 76 92 62 120 74C150 86 182 72 224 28"
                          stroke="url(#context-shimmer)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray="26 206"
                          animate={{ strokeDashoffset: [232, 0] }}
                          transition={{ duration: 5.4, repeat: Infinity, ease: "linear" }}
                        />
                      ) : null}
                      <motion.path
                        d="M20 48C58 34 90 38 118 58"
                        stroke="#cfd6ff"
                        strokeOpacity={hoveredSupportCard === index ? 0.5 : 0.35}
                        strokeWidth="1.5"
                        initial={reducedMotion ? false : { pathLength: 0, opacity: 0.2 }}
                        whileInView={reducedMotion ? undefined : { pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.9, delay: 0.18, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="context-shimmer" x1="0" y1="0" x2="232" y2="0" gradientUnits="userSpaceOnUse">
                          <stop stopColor="rgba(255,255,255,0)" />
                          <stop offset="0.45" stopColor="rgba(255,255,255,0.0)" />
                          <stop offset="0.6" stopColor="rgba(255,255,255,0.8)" />
                          <stop offset="0.78" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <motion.div
                      className="absolute left-[50px] top-[156px] h-[42px] w-[70px] rounded-[16px] border border-white/10 bg-white/5"
                      animate={reducedMotion ? undefined : { opacity: [0.45, 0.55, 0.45] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute left-[124px] top-[138px] h-[60px] w-[80px] rounded-[16px] border border-[#7b8cff]/40 bg-[rgba(123,140,255,0.12)]"
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
                      whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.55, delay: 0.42, ease: "easeOut" }}
                      animate={reducedMotion ? undefined : { boxShadow: hoveredSupportCard === index ? "0 12px 36px rgba(123,140,255,0.2)" : "0 8px 24px rgba(123,140,255,0.08)" }}
                    />
                    <motion.div
                      className="absolute right-[44px] top-[120px] h-[78px] w-[74px] rounded-[16px] border border-white/10 bg-white/5"
                      animate={reducedMotion ? undefined : { opacity: [0.45, 0.58, 0.45] }}
                      transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute right-[26px] top-[42px] rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-medium text-white/70"
                      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.62, ease: "easeOut" }}
                      animate={reducedMotion ? undefined : { opacity: hoveredSupportCard === index ? 1 : 0.78, borderColor: hoveredSupportCard === index ? "rgba(123,140,255,0.35)" : "rgba(255,255,255,0.1)" }}
                    >
                      Setor
                    </motion.div>
                    <div className="absolute left-0 top-0 h-[95px] w-full bg-gradient-to-b from-black to-transparent" />
                    <div className="absolute bottom-0 left-0 h-[95px] w-full bg-gradient-to-t from-black to-transparent" />
                  </div>
                ) : (
                  <div className="relative h-[243px] w-[317px] shrink-0 overflow-hidden rounded-[20px] bg-black">
                    <div className="absolute left-[14px] top-4 h-[212px] w-[288px] rounded-[20px] border border-white/6 bg-[radial-gradient(circle_at_top,rgba(255,183,77,0.14),transparent_50%),radial-gradient(circle_at_70%_30%,rgba(74,144,226,0.15),transparent_42%)]" />
                    <motion.div
                      className="absolute left-[54px] top-[64px] h-[52px] w-[116px] rounded-[16px] border border-white/10 bg-white/6"
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      whileInView={reducedMotion ? undefined : { opacity: 0.78, y: 0 }}
                      transition={
                        reducedMotion
                          ? { duration: 0.45, delay: 0.2, ease: "easeOut" }
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : {
                                opacity: { duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                                scale: { duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                              }
                      }
                      animate={reducedMotion ? undefined : { opacity: hoveredSupportCard === index ? 0.32 : [0.56, 0.72, 0.56], scale: hoveredSupportCard === index ? 0.98 : 1 }}
                    />
                    <motion.div
                      className="absolute left-[88px] top-[124px] h-[78px] w-[144px] rounded-[18px] border border-[#ffb74d]/40 bg-[rgba(255,183,77,0.1)] shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
                      initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.96 }}
                      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              y: hoveredSupportCard === index ? -5 : [1, -3, 1],
                              scale: hoveredSupportCard === index ? 1.04 : [0.985, 1.025, 0.985],
                              opacity: hoveredSupportCard === index ? 1 : [0.88, 1, 0.88],
                              boxShadow:
                                hoveredSupportCard === index
                                  ? "0 22px 46px rgba(255,183,77,0.16)"
                                  : ["0 16px 40px rgba(0,0,0,0.22)", "0 18px 42px rgba(0,0,0,0.28)", "0 16px 40px rgba(0,0,0,0.22)"],
                            }
                      }
                      transition={{
                        y: { duration: hoveredSupportCard === index ? 0.2 : 4.8, repeat: hoveredSupportCard === index ? 0 : Infinity, ease: "easeInOut" },
                        scale: { duration: hoveredSupportCard === index ? 0.2 : 4.8, repeat: hoveredSupportCard === index ? 0 : Infinity, ease: "easeInOut" },
                        boxShadow: { duration: hoveredSupportCard === index ? 0.2 : 4.8, repeat: hoveredSupportCard === index ? 0 : Infinity, ease: "easeInOut" },
                      }}
                    />
                    <motion.div
                      className="absolute right-[44px] top-[76px] h-[48px] w-[92px] rounded-[16px] border border-white/10 bg-white/6"
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      whileInView={reducedMotion ? undefined : { opacity: 0.72, y: 0 }}
                      transition={
                        reducedMotion
                          ? { duration: 0.45, delay: 0.3, ease: "easeOut" }
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : {
                                opacity: { duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
                                scale: { duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
                              }
                      }
                      animate={reducedMotion ? undefined : { opacity: hoveredSupportCard === index ? 0.24 : [0.42, 0.62, 0.42], scale: hoveredSupportCard === index ? 0.96 : [1, 0.985, 1], y: hoveredSupportCard === index ? 1 : [0, 2, 0] }}
                    />
                    <motion.div
                      className="absolute right-[58px] top-[138px] h-[56px] w-[74px] rounded-[16px] border border-white/10 bg-white/5"
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      whileInView={reducedMotion ? undefined : { opacity: 0.66, y: 0 }}
                      transition={
                        reducedMotion
                          ? { duration: 0.45, delay: 0.38, ease: "easeOut" }
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : {
                                opacity: { duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 0.38 },
                                scale: { duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 0.38 },
                              }
                      }
                      animate={reducedMotion ? undefined : { opacity: hoveredSupportCard === index ? 0.22 : [0.38, 0.54, 0.38], scale: hoveredSupportCard === index ? 0.96 : [1, 0.985, 1], y: hoveredSupportCard === index ? 2 : [0, 3, 0] }}
                    />
                    <motion.div
                      className="absolute left-[110px] top-[116px] h-[96px] w-[122px] rounded-[22px] bg-[radial-gradient(circle,rgba(255,183,77,0.16)_0%,rgba(255,183,77,0.05)_55%,transparent_78%)]"
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              opacity: hoveredSupportCard === index ? 0.9 : [0.38, 0.62, 0.38],
                              scale: hoveredSupportCard === index ? 1.05 : [0.96, 1.04, 0.96],
                            }
                      }
                      transition={
                        reducedMotion
                          ? undefined
                          : hoveredSupportCard === index
                            ? { duration: 0.2, ease: "easeOut" }
                            : { duration: 5, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                    <div className="absolute left-0 top-0 z-20 h-[95px] w-full bg-gradient-to-b from-black to-transparent" />
                    <div className="absolute bottom-0 left-0 z-20 h-[95px] w-full bg-gradient-to-t from-black to-transparent" />
                  </div>
                )}
                <div className="flex flex-col items-center gap-4 text-center">
                  <h4 className="text-2xl font-semibold leading-7 tracking-[-0.24px] text-white max-sm:text-[20px] max-sm:leading-6">
                    {item.title}
                  </h4>
                  <p className="max-w-[346px] text-base leading-6 text-[#999]">{item.text}</p>
                </div>
                <div className="assistants-card-glow pointer-events-none absolute -top-px left-0 right-0 z-30 h-16 rounded-3xl opacity-40 blur-[78.8px] max-md:opacity-20" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const [heroQuery, setHeroQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const normalizedQuery = heroQuery.trim().toLowerCase();
  const filteredHeroResults =
    normalizedQuery.length === 0
      ? heroSearchResults
      : heroSearchResults.filter(
          (item) =>
            item.ticker.toLowerCase().includes(normalizedQuery) ||
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.sector.toLowerCase().includes(normalizedQuery),
        );
  const visibleHeroResults = filteredHeroResults.slice(0, 3);
  const featuredHeroResult = visibleHeroResults[0];
  const secondaryHeroResults = visibleHeroResults.slice(1);
  const shouldShowHeroPanel = isSearchFocused && visibleHeroResults.length > 0;

  return (
    <section className="mt-2 px-5 max-sm:mt-0 max-sm:px-0">
      <div className="w-full overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#ffffff_0%,#f5fcfa_42%,#d8f3ed_100%)] max-sm:rounded-none">
        <div className="mx-auto max-w-[1430px] relative flex items-center justify-between flex-wrap px-8 pt-8 max-md:px-4 max-md:pt-5">
          <a href="/" className="order-1 flex shrink-0 items-center">
            <img
              src={logoImage.src}
              alt="Analiso"
              className="h-[25px] w-auto max-md:h-[20px]"
              draggable="false"
            />
          </a>
          <div className="absolute left-1/2 order-2 flex -translate-x-1/2 items-center gap-0.5 max-md:hidden">
            <a href="/" className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-primary-gray-700">Início</a>
            <a href="#atuacao" className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-primary-gray-700">Atuação</a>
            <a href="#solucao" className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-primary-gray-700">Solução</a>
            <a href="#assistentes" className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-primary-gray-700">Assistentes IA</a>
            <a href="#faq" className="whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 text-[#999] transition-colors hover:text-primary-gray-700">FAQ</a>
          </div>
          <a
            href="/login"
            className="order-3 flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-primary-gray-100 bg-white px-4 py-3.5 text-sm font-semibold leading-5 text-black shadow-small transition-all duration-300 ease-out hover:border-primary-gray-200 hover:ring-2 hover:ring-ring-blue-light hover:ring-offset-2 hover:ring-offset-white focus:outline-none focus:ring-2 focus:ring-ring-blue-light focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98]"
          >
            Entrar
          </a>
        </div>

        <div className="flex flex-col items-center px-8 pt-16 max-md:pt-12">
          <motion.h1
            className="w-[700px] text-center text-[56px] leading-[62px] tracking-[-1.12px] max-lg:w-full max-lg:max-w-[700px] max-lg:px-4 max-md:text-[40px] max-md:leading-[46px] max-md:tracking-[-0.8px] max-sm:px-2 max-sm:text-[32px] max-sm:leading-[38px] max-sm:tracking-[-0.64px]"
            style={{
              fontWeight: 600,
              background: "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              paddingBottom: "10px",
            }}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Entenda empresas com clareza, não com excesso de indicadores.
          </motion.h1>

          <motion.div
            className="mt-10 w-full max-w-[466px] max-md:mt-8 max-sm:max-w-full max-sm:px-0"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative w-full">
              <form
                id="waitlist"
                onSubmit={(event) => event.preventDefault()}
                className="relative z-[2] flex w-full items-center gap-2.5 rounded-2xl border border-[#f0f0f0] bg-white py-2 pl-4 pr-2 shadow-[0_6px_18px_rgba(0,0,0,0.05)] max-sm:py-1.5 max-sm:pl-3 max-sm:pr-1.5"
                style={{ padding: "8px 8px 8px 16px" }}
                aria-label="Formulário de lista de espera"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-[#b7b7b7]">
                  <path
                    d="M12.75 15.375H5.25C3 15.375 1.5 14.25 1.5 11.625V6.375C1.5 3.75 3 2.625 5.25 2.625H12.75C15 2.625 16.5 3.75 16.5 6.375V11.625C16.5 14.25 15 15.375 12.75 15.375Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.75 6.75L10.4025 8.625C9.63 9.24 8.3625 9.24 7.59 8.625L5.25 6.75"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <label htmlFor="hero-email" className="sr-only">
                  Busque uma empresa ou ticker
                </label>
                <input
                  id="hero-email"
                  type="text"
                  name="query"
                  value={heroQuery}
                  onChange={(event) => setHeroQuery(event.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 140)}
                  placeholder="Busque uma empresa ou ticker"
                  className="min-w-0 flex-1 self-stretch bg-transparent text-sm leading-5 text-[#171717] outline-none placeholder:text-[#b7b7b7]"
                  required
                />
                <button
                  type="submit"
                  className="shrink-0 cursor-pointer rounded-[10px] border border-[#0f9f8f] bg-[#0f9f8f] px-4 py-3.5 text-sm font-semibold leading-5 text-white transition-all duration-300 ease-out hover:border-[#18b6a4] hover:bg-[#18b6a4] hover:ring-2 hover:ring-[#d7f5f0] hover:ring-offset-2 hover:ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#d7f5f0] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] max-md:px-3 max-md:py-2.5 max-md:text-xs"
                >
                  Explorar análise
                </button>
              </form>

              <AnimatePresence>
                {shouldShowHeroPanel ? (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
                    animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                    exit={reducedMotion ? {} : { opacity: 0, y: 8, scale: 0.985 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 right-0 top-[calc(100%+12px)] z-[3]"
                  >
                    <div className="rounded-[24px] border border-[#edf1f0] bg-[rgba(255,255,255,0.98)] p-4 shadow-[0_16px_40px_rgba(16,24,40,0.08)] backdrop-blur-sm">
                      <div className="mb-3 px-1 text-xs font-semibold leading-[18px] text-[#7b8683]">
                        Empresa encontrada
                      </div>

                      {featuredHeroResult ? (
                        <a
                          href="#assistentes"
                          onMouseDown={() => {
                            setHeroQuery(featuredHeroResult.ticker);
                            setIsSearchFocused(false);
                          }}
                          className="group flex w-full cursor-pointer items-start justify-between gap-4 rounded-[20px] border border-[#edf1f0] bg-[#fcfdfc] p-4 text-left transition-all duration-200 hover:-translate-y-[2px] hover:border-[#c7ddd6] hover:bg-white hover:shadow-[0_14px_30px_rgba(16,24,40,0.10)]"
                        >
                          <div className="min-w-0">
                            <div className="inline-flex rounded-full border border-[#e7ecea] bg-white px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em] text-[#5e6b67]">
                              {featuredHeroResult.ticker}
                            </div>
                            <div className="mt-3 text-[18px] font-semibold leading-6 tracking-[-0.02em] text-[#171717]">
                              {featuredHeroResult.name}
                            </div>
                            <div className="mt-1 text-[11px] leading-[14px] text-[#adb6b4]">
                              {featuredHeroResult.sector}
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="hidden rounded-[16px] border border-[#edf1f0] bg-white p-3 md:block">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-11 flex-col justify-center gap-1.5 rounded-[12px] bg-[#eef8f5] px-2 transition-colors duration-200 group-hover:bg-[#e5f6f1]">
                                  <div className="h-[5px] w-4 rounded-full bg-[#0f9f8f]" />
                                  <div className="h-[5px] w-6 rounded-full bg-[#93dccb]" />
                                  <div className="h-[5px] w-3 rounded-full bg-[#cfeee6]" />
                                </div>
                                <div className="flex min-w-[64px] flex-col gap-1.5">
                                  <div className="h-2.5 w-14 rounded-full bg-[#e8efed]" />
                                  <div className="flex gap-1.5">
                                    <div className="h-2.5 w-8 rounded-full bg-[#dff3ed]" />
                                    <div className="h-2.5 w-5 rounded-full bg-[#edf1f0]" />
                                  </div>
                                  <div className="h-2.5 w-10 rounded-full bg-[#edf1f0]" />
                                </div>
                              </div>
                            </div>
                            <div className="whitespace-nowrap rounded-full border border-[#d9e5e0] bg-[#f7faf9] px-3.5 py-1 text-[9.5px] font-semibold tracking-[0.01em] text-[#647f77]">
                              {featuredHeroResult.available}
                            </div>
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#65716d] transition-transform duration-200 group-hover:translate-x-[2px]" />
                          </div>
                        </a>
                      ) : null}

                      {secondaryHeroResults.length > 0 ? (
                        <div className="mt-3 grid gap-2">
                          {secondaryHeroResults.map((item) => (
                            <button
                              key={item.ticker}
                              type="button"
                              onMouseDown={() => {
                                setHeroQuery(item.ticker);
                                setIsSearchFocused(false);
                              }}
                              className="flex w-full items-center justify-between gap-4 rounded-[18px] border border-[#f0f2f1] bg-white px-4 py-3 text-left transition-all duration-200 hover:border-[#dde6e3] hover:bg-[#fcfdfc]"
                            >
                              <div className="min-w-0">
                                <div className="inline-flex rounded-full border border-[#edf1f0] bg-[#fbfcfb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5f6d69]">
                                  {item.ticker}
                                </div>
                                <div className="mt-2 truncate text-[14px] font-semibold text-[#1b2421]">
                                  {item.name}
                                </div>
                              </div>
                              <div className="rounded-full border border-[#edf1f0] bg-[#fbfcfb] px-3 py-1 text-[10px] font-semibold text-[#6d7775]">
                                {item.available}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

          </motion.div>

          <div className="mt-6 flex flex-col items-center gap-y-2">
            <div className="flex items-center justify-center gap-x-1.5">
              {heroChips.slice(0, 5).map((chip) => (
                <span
                  key={chip}
                  className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold leading-[18px] text-[#171717] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-x-1.5">
              {heroChips.slice(5).map((chip) => (
                <span
                  key={chip}
                  className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold leading-[18px] text-[#171717] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          className="relative mt-[84px] w-full overflow-hidden max-lg:mt-12 max-md:mt-10"
          initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="mx-auto max-w-[1430px] relative">
            <HeroDashboard />

            {/* Agent Card overlay */}
            <div className="absolute right-[62px] top-[28px] h-[260px] w-[236px] max-xl:right-4 max-lg:hidden">
              <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-[#e6efff] bg-white shadow-[0_18px_48px_rgba(15,23,40,0.12)]">
                {/* Animated border trace */}
                <div className="pointer-events-none absolute inset-0 rounded-[20px]">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 236 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="234" height="258" rx="19" stroke="url(#agent-base-grad)" strokeWidth="1.5" />
                    <motion.rect
                      x="1"
                      y="1"
                      width="234"
                      height="258"
                      rx="19"
                      stroke="url(#agent-trace-grad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="110 700"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -810 }}
                      transition={{ duration: 1.35, ease: "linear", repeat: Infinity }}
                    />
                    <defs>
                      <linearGradient id="agent-base-grad" x1="0" y1="0" x2="236" y2="260" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0e9384" stopOpacity="0.2" />
                        <stop offset="1" stopColor="#0e9384" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="agent-trace-grad" x1="0" y1="0" x2="236" y2="260" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#99f6e4" />
                        <stop offset="0.45" stopColor="#0e9384" />
                        <stop offset="1" stopColor="#5eead4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex h-full flex-col p-4">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(140deg,#7fe4d6,#0f9f8f)]">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[#171717]">Análise Simplificada</div>
                      <div className="text-[9px] text-[#9b9b9b]">WEGE3 — Weg S.A.</div>
                    </div>
                  </div>
                  {/* Score */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[36px] font-bold leading-none text-[#0e9384]">85</span>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-[#aaa]">Score /100</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e2edf5]">
                        <div className="h-full rounded-full bg-[#0e9384]" style={{ width: "85%" }} />
                      </div>
                    </div>
                  </div>
                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="rounded-full border border-[#99f6e4] bg-[#f0fdfa] px-2 py-0.5 text-[9px] font-semibold text-[#0e9384]">Forte crescimento</span>
                    <span className="rounded-full border border-[#e2edf5] bg-[#f6fafc] px-2 py-0.5 text-[9px] text-[#334155]">Baixo risco</span>
                    <span className="rounded-full border border-[#e2edf5] bg-[#f6fafc] px-2 py-0.5 text-[9px] text-[#334155]">Margens estáveis</span>
                  </div>
                  {/* Mini chart */}
                  <div className="mt-3 flex-1 overflow-hidden rounded-[12px] bg-[#f6fafc] p-2">
                    <div className="mb-1 text-[9px] text-[#9b9b9b]">Score histórico — 12m</div>
                    <svg viewBox="0 0 180 52" className="h-[52px] w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="ac-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0e9384" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#0e9384" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon points="0,42 18,38 36,34 54,28 72,24 90,18 108,14 126,10 144,7 162,4 180,2 180,52 0,52" fill="url(#ac-grad)" />
                      <polyline points="0,42 18,38 36,34 54,28 72,24 90,18 108,14 126,10 144,7 162,4 180,2" stroke="#0e9384" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {/* Summary text */}
                  <p className="mt-2 text-[9.5px] leading-[14px] text-[#7a7a7a]">
                    Weg apresenta expansão consistente de margens e geração de caixa acima da média setorial.
                  </p>
                </div>
              </div>
            </div>

                {/* Insight update card overlay */}
                <div className="absolute right-[62px] top-[297px] h-[62px] w-[236px] max-xl:right-4 max-lg:hidden">
                  <div className="flex h-full items-center gap-3 overflow-hidden rounded-[16px] border border-[#e6efff] bg-white px-4 shadow-[0_8px_24px_rgba(15,23,40,0.08)]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(140deg,#7fe4d6,#0f9f8f)]">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold text-[#171717]">Novo resultado disponível</div>
                      <div className="mt-0.5 truncate text-[9px] text-[#9b9b9b]">WEGE3 — 4T24 · Análise pronta</div>
                    </div>
                  </div>
                </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function HeroMarqueeSection() {
  const reduceMotion = useReducedMotion();
  const repeatedItems = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <section className="px-20 py-12 max-lg:px-10 max-md:px-6 max-md:py-8 max-sm:px-4">
      <div className="mx-auto w-full max-w-[1430px] overflow-hidden">
        <div
          className="relative"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <motion.div
            className="flex w-max items-start"
            animate={reduceMotion ? undefined : { x: ["0%", "-33.333%"] }}
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 5.5,
                    ease: "linear",
                    repeat: Infinity,
                  }
            }
          >
            {repeatedItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={`${item.label}-${index}`}
                  aria-hidden={index >= marqueeItems.length}
                  className="mr-4 flex h-[94px] w-[95px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl last:mr-0"
                >
                  <Icon className="h-5 w-5 text-[#c4c4c4]" />
                  <span className="text-sm font-medium leading-5 text-[#c4c4c4]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function AnalysisMomentsSection() {
  return (
    <section
      id="atuacao"
      className="px-20 pb-16 pt-24 max-lg:px-10 max-md:px-6 max-md:pb-10 max-md:pt-12 max-sm:px-4"
    >
      <div className="mx-auto max-w-[1430px]">
        <div className="flex flex-col items-center gap-6">
          <span className="rounded-lg bg-[#e7fbf7] px-2 py-1 text-xs font-semibold leading-[18px] text-[#0f9f8f]">
            Para quem é
          </span>
          <h2
            className="max-w-[560px] bg-clip-text text-center text-[40px] font-semibold leading-[42px] tracking-[-0.4px] text-transparent max-md:text-[32px] max-md:leading-[36px] max-md:tracking-[-0.32px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.28px]"
            style={{
              backgroundImage:
                "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
            }}
          >
            Clareza para diferentes
            <br />
            momentos da análise.
          </h2>
          <p className="max-w-[525px] text-center text-lg leading-6 text-[#7a7a7a]">
            Da primeira leitura ao acompanhamento contínuo, a Analiso ajuda você a entender empresas sem se perder no ruído.
          </p>
        </div>

        <div className="mt-16 flex gap-px overflow-hidden rounded-[20px] border-y border-[#f3f3f3] bg-[#f3f3f3] max-lg:flex-col max-lg:gap-0 max-md:mt-8 max-md:rounded-[16px]">
          {segments.map((segment, index) => (
            <SegmentCard
              key={segment.title}
              index={index}
              title={segment.title}
              description={segment.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function StepsSection() {
  return (
    <section className="px-20 pb-[120px] pt-[100px] max-lg:px-10 max-md:px-6 max-md:pb-16 max-md:pt-16 max-sm:px-4">
      <div className="mx-auto max-w-[1430px]">
        <div className="flex flex-col gap-14">
          <div className="flex items-end justify-between max-md:flex-col max-md:items-start max-md:gap-6">
            <div className="flex w-[534px] flex-col items-start gap-6 max-md:w-full">
              <span className="rounded-lg bg-[#e7fbf7] px-2 py-1 text-xs font-semibold leading-[18px] text-[#0f9f8f]">
                Passo a Passo
              </span>
              <h2
                className="bg-clip-text text-[40px] font-semibold leading-[42px] tracking-[-0.4px] text-transparent max-md:text-[32px] max-md:leading-[36px] max-md:tracking-[-0.32px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.28px]"
                style={{
                  backgroundImage:
                    "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
                }}
              >
                Da primeira leitura ao acompanhamento.
              </h2>
              <p className="text-lg leading-6 text-[#7a7a7a]">
                Veja como a Analiso guia sua análise.
              </p>
            </div>

            <button className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#ececec] bg-white px-4 py-[14px] text-sm font-semibold leading-5 text-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:border-[#d9d9d9] hover:ring-2 hover:ring-[#d7f5f0] hover:ring-offset-2 hover:ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#d7f5f0] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98]">
              Conhecer a Analiso
            </button>
          </div>

          <StepCards />
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="px-20 pt-[130px] max-lg:px-10 max-md:px-6 max-md:pt-16 max-sm:px-4"
    >
      <div className="mx-auto flex max-w-[1430px] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-[26px] items-center justify-center rounded-[8px] bg-[#e7fbf7] px-2 py-1">
            <span className="text-xs font-semibold leading-[18px] text-[#0f9f8f]">
              Dúvidas
            </span>
          </div>
          <h2 className="pb-1 text-center text-[40px] font-semibold leading-[42px] tracking-[-0.4px] text-black max-md:text-[32px] max-md:leading-[36px] max-md:tracking-[-0.32px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.28px]">
            Perguntas frequentes
          </h2>
          <p className="max-w-[420px] text-center text-lg leading-6 text-primary-gray-500 max-md:max-w-full max-md:text-base">
            Entenda como a Analiso funciona e o que ela entrega.
          </p>
        </div>

        <div className="w-[868px] overflow-hidden rounded-[20px] border border-primary-gray-50 bg-white shadow-small max-lg:w-full max-md:rounded-[16px]">
          {faqItems.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div key={faq.question} className="faq-item" data-faq-index={index}>
                {index > 0 ? <div className="mx-8 h-px bg-[#f2f2f2] max-md:mx-5" /> : null}
                <div className="px-8 py-8 max-md:px-5 max-md:py-6">
                  <button
                    type="button"
                    className="faq-trigger flex w-full cursor-pointer items-center justify-between"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-left text-base font-semibold leading-6 text-primary-gray-900 max-md:text-sm max-md:leading-5">
                      {faq.question}
                    </span>
                    <div
                      className={`faq-icon-wrap flex shrink-0 items-center p-2 text-primary-gray-300 transition-all duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      <svg className="size-5" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10 4.16669V15.8334"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4.16667 10H15.8333"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    className="faq-answer overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isOpen ? "220px" : "0px", opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="faq-answer-inner">
                      <div className="pt-2">
                        <p className="max-w-[561px] max-md:max-w-full text-base max-md:text-sm font-normal leading-6 max-md:leading-5 text-primary-gray-500">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="px-5 pt-[130px] max-md:pt-16 max-sm:px-0">
      <div
        className="relative h-[466px] w-full overflow-hidden rounded-[20px] max-md:h-auto max-md:rounded-[16px] max-md:pb-16 max-sm:rounded-none"
        style={{
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 45%, #E8F8F4 70%, #B7E9DD 100%)",
        }}
      >
        <div className="pointer-events-none absolute left-1/2 top-[calc(50%+39px)] -translate-x-1/2 -translate-y-1/2 max-md:scale-50">
          {[980, 750, 536, 333].map((size) => (
            <div
              key={size}
              className="footer-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cfece4]"
              style={{
                width: size,
                height: size,
                boxShadow: "0 0 0 1px rgba(255,255,255,0.2) inset",
              }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute left-0 top-0 z-[1] h-[45%] w-full bg-gradient-to-b from-white via-white to-transparent" />
        <div className="relative z-10 flex flex-col items-center gap-6 pt-[60px] max-md:px-6 max-sm:px-8">
          <h2 className="max-w-[600px] text-center text-[56px] font-semibold leading-[56px] tracking-[-1.12px] text-black max-md:text-[36px] max-md:leading-[40px] max-md:tracking-[-0.72px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.56px]">
            Pronto para transformar sua análise?
          </h2>
          <p className="max-w-[360px] text-center text-lg leading-6 text-primary-gray-500">
            Entre na lista de espera e receba acesso antecipado à plataforma.
          </p>
          <button
            type="button"
            className="w-full max-w-[466px] cursor-pointer rounded-[16px] border border-[#0f9f8f] bg-[#0f9f8f] px-8 py-5 text-base font-semibold leading-6 text-white transition-all duration-300 ease-out hover:border-[#18b6a4] hover:bg-[#18b6a4] hover:ring-2 hover:ring-[#bfeee6] hover:ring-offset-2 hover:ring-offset-white focus:border-[#0f9f8f] focus:outline-none focus:ring-2 focus:ring-[#bfeee6] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] max-md:max-w-[420px] max-md:px-6 max-md:py-4 max-md:text-sm"
          >
            Começar grátis
          </button>
        </div>
      </div>
      <div className="py-6 text-center text-[13px] text-[#8f8f8f]">
        © 2026 Analiso. Todos os direitos reservados.
      </div>
    </section>
  );
}

export function LandingSections() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <main>
        <HeroSection />
        <ScrollReveal delay={0.02}>
          <HeroMarqueeSection />
        </ScrollReveal>

        <ScrollReveal delay={0.03}>
        <section
          id="atuacao"
          className="px-20 pb-16 pt-24 max-lg:px-10 max-md:px-6 max-md:pb-10 max-md:pt-12 max-sm:px-4"
        >
          <div className="mx-auto max-w-[1430px]">
            <div className="flex flex-col items-center gap-6">
              <span className="rounded-lg bg-[#e7fbf7] px-2 py-1 text-xs font-semibold leading-[18px] text-[#0f9f8f]">
                Para quem é
              </span>
              <h2
                className="max-w-[560px] bg-clip-text text-center text-[40px] font-semibold leading-[42px] tracking-[-0.4px] text-transparent max-md:text-[32px] max-md:leading-[36px] max-md:tracking-[-0.32px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.28px]"
                style={{
                  backgroundImage:
                    "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
                }}
              >
                Clareza para diferentes
                <br />
                momentos da análise.
              </h2>
              {false && <p className="max-w-[525px] text-center text-lg leading-6 text-[#7a7a7a]">
                A Analiso organiza os dados de uma empresa em uma leitura guiada e verificável, para você entender mais rápido o que importa sem se perder no ruído.
              </p>}
              <p className="max-w-[525px] text-center text-lg leading-6 text-[#7a7a7a]">
                Da primeira leitura ao acompanhamento contínuo, a Analiso ajuda você a entender empresas sem se perder no ruído.
              </p>
            </div>

            <div className="mt-16 flex gap-px overflow-hidden rounded-[20px] border-y border-[#f3f3f3] bg-[#f3f3f3] max-lg:flex-col max-lg:gap-0 max-md:mt-8 max-md:rounded-[16px]">
              {segments.map((segment, index) => (
                <SegmentCard
                  key={segment.title}
                  index={index}
                  title={segment.title}
                  description={segment.description}
                />
              ))}
            </div>
          </div>
        </section>
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
          <SolutionSection />
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
        <section className="px-20 pb-[120px] pt-[100px] max-lg:px-10 max-md:px-6 max-md:pb-16 max-md:pt-16 max-sm:px-4">
          <div className="mx-auto max-w-[1430px]">
            <div className="flex flex-col gap-14">
              <div className="flex items-end justify-between max-md:flex-col max-md:items-start max-md:gap-6">
                <div className="flex w-[534px] flex-col items-start gap-6 max-md:w-full">
                  <span className="rounded-lg bg-[#e7fbf7] px-2 py-1 text-xs font-semibold leading-[18px] text-[#0f9f8f]">
                    Passo a Passo
                  </span>
                  <h2
                    className="bg-clip-text text-[40px] font-semibold leading-[42px] tracking-[-0.4px] text-transparent max-md:text-[32px] max-md:leading-[36px] max-md:tracking-[-0.32px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.28px]"
                    style={{
                      backgroundImage:
                        "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
                    }}
                  >
                    Da primeira leitura ao acompanhamento.
                  </h2>
                  <p className="text-lg leading-6 text-[#7a7a7a]">
                    Veja como a Analiso guia sua análise.
                  </p>
                </div>

                <button className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#ececec] bg-white px-4 py-[14px] text-sm font-semibold leading-5 text-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:border-[#d9d9d9] hover:ring-2 hover:ring-[#d7f5f0] hover:ring-offset-2 hover:ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#d7f5f0] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98]">
                  Conhecer a Analiso
                </button>
              </div>

              <StepCards />
            </div>
          </div>
        </section>
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
          <ReadableCompanySection />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <AnalysisFlowSection />
        </ScrollReveal>

        {false && <section id="allan" className="px-4 py-16 md:px-6 md:py-10">
          <div className="mx-auto max-w-[1140px]">
            <div className="mx-auto max-w-[700px] text-center">
              <h2 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#2a2a2a] md:text-[58px]">
                Uma equipe de IA trabalhando
                <br />
                pela sua clínica.
              </h2>
              <p className="mx-auto mt-5 max-w-[500px] text-[17px] text-[#7a7a7a]">
                Assistentes especializados que automatizam tarefas clínicas, financeiras e operacionais.
              </p>
              <div className="mt-7 flex items-center justify-center gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-12 w-12 rounded-full ${
                      item === 1
                        ? "bg-[radial-gradient(circle,#d9b79f_0%,#f4f4f4_38%,#8ab1ff_39%,#d8ebff_100%)] opacity-100"
                        : "bg-[radial-gradient(circle,#d9b79f_0%,#f4f4f4_38%,#d7b8ff_39%,#f7f7f7_100%)] opacity-35"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-10">
              <AIWorkCard />
            </div>
          </div>
        </section>}

        <ScrollReveal delay={0.05}>
          <DarkCapabilities />
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
        <section
          id="faq"
          className="px-20 pt-[130px] max-lg:px-10 max-md:px-6 max-md:pt-16 max-sm:px-4"
        >
          <div className="mx-auto flex max-w-[1430px] flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-[26px] items-center justify-center rounded-[8px] bg-primary-bluebrand-50 px-2 py-1">
                <span className="text-xs font-semibold leading-[18px] text-primary-bluebrand-600">
                  Dúvidas
                </span>
              </div>
              <h2 className="pb-1 text-center text-[40px] font-semibold leading-[42px] tracking-[-0.4px] text-black max-md:text-[32px] max-md:leading-[36px] max-md:tracking-[-0.32px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.28px]">
                Perguntas frequentes
              </h2>
              <p className="max-w-[279px] text-center text-lg leading-6 text-primary-gray-500 max-md:max-w-full max-md:text-base">
                Algumas respostas sobre a Analiso e o acesso antecipado.
              </p>
            </div>

            <div className="w-[868px] overflow-hidden rounded-[20px] border border-primary-gray-50 bg-white shadow-small max-lg:w-full max-md:rounded-[16px]">
              {faqItems.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question} className="faq-item" data-faq-index={index}>
                    {index > 0 ? <div className="mx-8 h-px bg-[#f2f2f2] max-md:mx-5" /> : null}
                    <div className="px-8 py-8 max-md:px-5 max-md:py-6">
                      <button
                        type="button"
                        className="faq-trigger flex w-full cursor-pointer items-center justify-between"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${index}`}
                      >
                        <span className="text-left text-base font-semibold leading-6 text-primary-gray-900 max-md:text-sm max-md:leading-5">
                          {faq.question}
                        </span>
                        <div
                          className={`faq-icon-wrap flex shrink-0 items-center p-2 text-primary-gray-300 transition-all duration-300 ${
                            isOpen ? "rotate-45" : ""
                          }`}
                        >
                          <svg className="size-5" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                              d="M10 4.16669V15.8334"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4.16667 10H15.8333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </button>
                      <div
                        id={`faq-answer-${index}`}
                        className="faq-answer overflow-hidden transition-all duration-300"
                        style={{ maxHeight: isOpen ? "220px" : "0px", opacity: isOpen ? 1 : 0 }}
                      >
                        <div className="faq-answer-inner">
                          <div className="pt-2">
                            <p className="max-w-[561px] text-base font-normal leading-6 text-primary-gray-500 max-md:max-w-full max-md:text-sm max-md:leading-5">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        </ScrollReveal>

        <section id="faq-legacy" className="hidden px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-[1140px]">
            <SectionHeading
              badge="Dúvidas"
              title="Perguntas frequentes"
              description="Algumas respostas sobre a Analiso e o acesso antecipado."
            />
            <div className="mx-auto mt-12 max-w-[700px] overflow-hidden rounded-[22px] border border-[#ebebeb] bg-white shadow-[0_15px_45px_rgba(0,0,0,0.03)]">
              {faqs.map((faq) => (
                <details key={faq} className="group border-b border-[#efefef] last:border-b-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-7 py-8 text-[16px] font-semibold text-[#111] marker:content-none">
                    {faq}
                    <span className="text-[30px] font-light text-[#bdbdbd] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-7 pb-8 text-[15px] leading-[1.55] text-[#757575]">
                    Acesso antecipado, novidades da plataforma e detalhes do lançamento serão enviados para os usuários da lista de espera.
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <ScrollReveal delay={0.04}>
        <section className="px-5 pt-[130px] max-md:pt-16 max-sm:px-0">
          <div
            className="relative h-[466px] w-full overflow-hidden rounded-[20px] max-md:h-auto max-md:rounded-[16px] max-md:pb-16 max-sm:rounded-none"
            style={{
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 45%, #E8F8F4 70%, #B7E9DD 100%)",
            }}
          >
            <div className="pointer-events-none absolute left-1/2 top-[calc(50%+39px)] -translate-x-1/2 -translate-y-1/2 max-md:scale-50">
              {[980, 750, 536, 333].map((size) => (
                <div
                  key={size}
                  className="footer-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cfece4]"
                  style={{
                    width: size,
                    height: size,
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.2) inset",
                  }}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute left-0 top-0 z-[1] h-[45%] w-full bg-gradient-to-b from-white via-white to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-6 pt-[60px] max-md:px-6 max-sm:px-8">
              <h2 className="max-w-[600px] text-center text-[56px] font-semibold leading-[56px] tracking-[-1.12px] text-black max-md:text-[36px] max-md:leading-[40px] max-md:tracking-[-0.72px] max-sm:text-[28px] max-sm:leading-[32px] max-sm:tracking-[-0.56px]">
                Pronto para transformar sua análise?
              </h2>
              <p className="max-w-[360px] text-center text-lg leading-6 text-primary-gray-500">
                Entre na lista de espera e receba acesso antecipado à plataforma.
              </p>
              <button
                type="button"
                className="w-full max-w-[466px] cursor-pointer rounded-[16px] border border-[#0f9f8f] bg-[#0f9f8f] px-8 py-5 text-base font-semibold leading-6 text-white transition-all duration-300 ease-out hover:border-[#18b6a4] hover:bg-[#18b6a4] hover:ring-2 hover:ring-[#bfeee6] hover:ring-offset-2 hover:ring-offset-white focus:border-[#0f9f8f] focus:outline-none focus:ring-2 focus:ring-[#bfeee6] focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] max-md:max-w-[420px] max-md:px-6 max-md:py-4 max-md:text-sm"
              >
                Começar grátis
              </button>
            </div>
          </div>
          <div className="py-6 text-center text-[13px] text-[#8f8f8f]">
            © 2026 Analiso. Todos os direitos reservados.
          </div>
        </section>
        </ScrollReveal>

        <section className="hidden px-4 pb-10 pt-8 md:px-6">
          <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_40%,#abd0ff_100%)] px-6 py-16 md:px-10 md:py-24">
            <div className="mx-auto max-w-[760px] text-center">
              <h2 className="text-[44px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#2a2a2a] md:text-[72px]">
                Seja um dos primeiros
                <br />
                a usar a Analiso.
              </h2>
              <p className="mx-auto mt-6 max-w-[450px] text-[17px] text-[#7a7a7a]">
                Entre na lista de espera e receba acesso antecipado à plataforma.
              </p>
              <div className="mt-10">
                <EmailForm />
              </div>
            </div>
          </div>
          <div className="py-6 text-center text-[13px] text-[#8f8f8f]">
            © 2026 Analiso. Todos os direitos reservados.
          </div>
        </section>
      </main>
    </div>
  );
}

