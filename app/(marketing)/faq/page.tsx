import { LandingNav } from "@/src/components/layout/LandingNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: "sobre",
    title: "Sobre a Analiso",
    questions: [
      {
        q: "O que é a Analiso?",
        a: "A Analiso é uma plataforma de análise de empresas brasileiras listadas na B3. Ela transforma demonstrações financeiras e indicadores em uma leitura estruturada, dividida em 5 pilares — Lucratividade, Endividamento, Eficiência, Crescimento e Valuation — com contexto histórico e pontos de atenção identificados automaticamente.",
      },
      {
        q: "Para quem é a Analiso?",
        a: "Para qualquer pessoa que quer entender melhor as empresas que investe ou pretende investir — sem precisar ser analista. Funciona tanto para quem está começando quanto para quem já tem experiência mas quer mais clareza e menos ruído no acompanhamento.",
      },
      {
        q: "O que diferencia a Analiso de outras plataformas?",
        a: "A maioria das plataformas mostra dados brutos — tabelas, gráficos e indicadores sem interpretação. A Analiso prioriza leitura guiada: cada pilar tem uma lógica clara, cada número vem com contexto histórico, e os pontos de atenção são sinalizados antes de você precisar procurar. Menos ruído, mais clareza.",
      },
      {
        q: "A Analiso dá recomendações de compra ou venda?",
        a: "Não. A Analiso não recomenda comprar ou vender nenhum ativo. Ela fornece análise estruturada para que você tome suas próprias decisões com mais clareza e contexto. Toda interpretação parte dos dados reais, sem viés especulativo.",
      },
    ],
  },
  {
    id: "como-funciona",
    title: "Como funciona na prática",
    questions: [
      {
        q: "O que são os 5 pilares de análise?",
        a: "Os 5 pilares são as dimensões que a Analiso usa para organizar a saúde de cada empresa: Lucratividade, Endividamento, Eficiência, Crescimento e Valuation. Cada pilar reúne os indicadores mais relevantes daquela dimensão, com histórico e pontos de atenção — em vez de exibir todos os indicadores de uma vez sem contexto.",
      },
      {
        q: "O que é o Resumo em 60s?",
        a: "É um resumo gerado automaticamente com o principal ponto forte e o principal ponto de atenção de cada empresa, baseado nos indicadores do período mais recente. O objetivo é dar uma leitura rápida e objetiva antes de você ir mais fundo em qualquer pilar.",
      },
      {
        q: "Como funcionam os alertas?",
        a: "Você pode configurar alertas para as empresas da sua Watchlist. Quando algo relevante acontece — resultados publicados, mudança significativa em um indicador, fato relevante divulgado — a plataforma te notifica. Você define quais tipos de alerta quer receber.",
      },
      {
        q: "Posso comparar empresas?",
        a: "Sim. A ferramenta de comparação permite colocar duas ou mais empresas lado a lado em cada pilar. Em vez de abrir várias abas e tentar lembrar os números, você vê tudo no mesmo lugar, com os mesmos critérios aplicados a cada empresa.",
      },
      {
        q: "O que é o Luiz?",
        a: "O Luiz é o assistente de IA integrado à plataforma. Você pode perguntar sobre qualquer empresa disponível — entender um indicador, comparar com o histórico, pedir um resumo ou tirar uma dúvida conceitual. O Luiz responde com base nos dados reais da Analiso.",
      },
    ],
  },
  {
    id: "dados",
    title: "Dados e fontes",
    questions: [
      {
        q: "De onde vêm os dados da Analiso?",
        a: "Os dados financeiros vêm de fontes oficiais: demonstrações financeiras publicadas pelas próprias empresas na CVM (Comissão de Valores Mobiliários) e documentos regulatórios. Nada de estimativas ou fontes não verificáveis.",
      },
      {
        q: "Com que frequência os dados são atualizados?",
        a: "Os dados são atualizados conforme as empresas publicam seus resultados — trimestral para a maioria das companhias. Quando um novo resultado é disponibilizado, a análise é atualizada automaticamente e você recebe um alerta se tiver a empresa na sua Watchlist.",
      },
      {
        q: "Consigo ver a fonte de cada indicador?",
        a: "Sim. Em cada indicador e ponto de atenção você pode acessar a fonte — o documento oficial da CVM que originou aquele dado. A verificação é parte do design, não um recurso escondido.",
      },
    ],
  },
  {
    id: "conta",
    title: "Conta e acesso",
    questions: [
      {
        q: "A Analiso é gratuita?",
        a: "Existe um plano gratuito que dá acesso a parte da plataforma. Para acesso completo a todas as análises, alertas ilimitados e comparações, existe um plano pago. Você pode começar gratuitamente e entender o produto antes de decidir.",
      },
      {
        q: "Como faço para criar uma conta?",
        a: "Basta clicar em 'Criar conta' e entrar com o Google ou com e-mail. Leva menos de um minuto e não exige cartão de crédito para começar.",
      },
      {
        q: "Posso cancelar quando quiser?",
        a: "Sim. Não há fidelidade ou multa por cancelamento. Se você decidir cancelar, basta acessar as configurações da sua conta — o cancelamento é imediato.",
      },
      {
        q: "A plataforma funciona no celular?",
        a: "Sim. A Analiso é responsiva e funciona bem em smartphones e tablets. Para uma experiência mais completa de análise — especialmente comparações e leitura de pilares — recomendamos usar em uma tela maior.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero */}
      <section className="px-6 pb-16 pt-20 md:px-10 md:pt-24 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="rounded-lg bg-brand-surface px-2 py-1 text-xs font-semibold leading-[18px] text-brand-text">
              FAQ
            </span>
            <h1
              className="max-w-[640px] bg-clip-text text-[42px] font-semibold leading-[46px] tracking-[-0.42px] text-transparent md:text-[52px] md:leading-[56px]"
              style={{
                backgroundImage:
                  "linear-gradient(347deg, #202020 47.75%, #8F8F8F 90.57%)",
              }}
            >
              Perguntas frequentes
            </h1>
            <p className="max-w-[480px] text-center text-lg leading-7 text-muted-foreground">
              Tudo o que você precisa saber antes de começar — sobre a
              plataforma, os dados e como funciona na prática.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <div className="mx-auto max-w-[860px] px-6 pb-24 md:px-10 lg:px-8">
        <div className="flex flex-col gap-12">
          {categories.map((category) => (
            <section key={category.id} id={category.id}>
              <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                {category.title}
              </h2>

              <div className="rounded-[16px] border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <Accordion type="single" collapsible className="px-6">
                  {category.questions.map((item, i) => (
                    <AccordionItem key={i} value={`${category.id}-${i}`}>
                      <AccordionTrigger className="py-5 text-sm font-medium text-foreground hover:no-underline hover:text-foreground">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-7 text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Divisor */}
      <div className="mx-auto max-w-[1430px] px-6 md:px-10 lg:px-8">
        <div className="h-px bg-border" />
      </div>

      {/* CTA final */}
      <section className="px-6 py-24 md:px-10 lg:px-8">
        <div className="mx-auto max-w-[1430px]">
          <div
            className="relative overflow-hidden rounded-[20px] px-10 py-16 text-center md:px-20"
            style={{
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #E8F8F4 60%, #B7E9DD 100%)",
            }}
          >
            <h2 className="mb-4 text-[36px] font-semibold leading-[40px] tracking-[-0.36px] text-foreground md:text-[44px] md:leading-[48px]">
              Ainda com dúvidas?
            </h2>
            <p className="mx-auto mb-8 max-w-[400px] text-lg leading-6 text-muted-foreground">
              A melhor forma de entender é abrindo uma análise real. Crie sua
              conta e comece em menos de um minuto.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/login"
                className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Criar conta gratuita
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/como-funciona"
                className="flex h-12 items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-6 text-sm font-semibold text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-colors hover:border-border-strong"
              >
                Ver como funciona
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
