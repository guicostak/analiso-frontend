
import logo from "../../assets/logos/logo.png";

export function LogoMark() {
  return (
    <a
      href="#inicio"
      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
    >
      <img
        src={logo}
        alt="Analiso"
        className="h-15 w-auto object-contain"
        loading="eager"
      />
      <span className="text-lg font-bold text-[#0F0F14]">Analiso</span>
    </a>
  );
}




