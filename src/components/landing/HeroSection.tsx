import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import type { NavLink } from "../../data/landing";
import { HeaderClient } from "./HeaderClient";
import heroImage from "../../assets/landing/hero_image.png";

interface HeroSectionProps {
  navLinks: NavLink[];
}

export function HeroSection({ navLinks }: HeroSectionProps) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-white">
      <div className="header-banner bg-[#0E9384]">
        <div className="mx-auto flex h-[50px] w-full max-w-[1454px] items-center justify-center px-4">
          <p
            style={{
              color: "#fff",
              fontSize: "16px",
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 1.4,
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            ✨ Cadastre-se e teste a Analiso gratuitamente por 28 dias!
          </p>
        </div>
      </div>

      <HeaderClient navLinks={navLinks} />

      <div
        className="relative mx-auto mt-[34px] h-[850px] w-full max-w-[1454px] bg-white"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1454px] items-center justify-center px-5 py-14 md:px-10">
          <div
            className="hero-content"
          >
            <p
              className="inline-flex items-center"
              style={{ gap: "7px", padding: "8px 18px", color: "#737373", fontSize: "14px", fontWeight: 400, lineHeight: "20px" }}
            >
              <Search className="h-[18px] w-[18px] text-[#0E9384]" />
              Software completo para investir com clareza
            </p>

            <h1
              className="mx-auto mt-2 max-w-[900px]"
              style={{ color: "#101727", fontWeight: 600, fontSize: "60px", lineHeight: "66px", wordSpacing: "0.06em" }}
            >
              Feita para quem quer
              <br />
              analisar com clareza,
              <br />
              não com{" "}
              <span className="-mx-6 inline-block" style={{ verticalAlign: "-0.48em" }}>
                <img
                  src={heroImage}
                  alt="Hero"
                  className="hero-image"
                />
              </span>{" "}
              confusão.
            </h1>

            <p
              className="-mt-[14px] mx-auto max-w-[760px]"
              style={{
                color: "#413e52",
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "130%",
                textWrap: "balance",
              }}
            >
              Com contexto e fonte oficial, mostramos o que realmente importa.
              <br />
              Entenda empresas e acompanhe mudanças com confiança.
            </p>

            <div>
              <Link
                to="/signup"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
                style={{
                  display: "inline-flex",
                  justifyContent: "center",
                  width: "358px",
                  alignItems: "center",
                  padding: "18px 40px",
                  borderRadius: "99px",
                  background: "linear-gradient(180deg, #22BFAE 0%, #0E9384 100%)",
                  boxShadow: "0px 8px 48px rgba(14, 147, 132, 0.4)",
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Conhecer a Analiso
              </Link>
              <p className="mt-3 text-base text-[#6B7280]">Teste grátis sem instalar nada.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



