/**
 * Persistência da URL de destino quando um usuário deslogado tenta acessar
 * uma tela protegida. Após login bem-sucedido, o fluxo de auth consome esse
 * valor para redirecionar o usuário de volta para onde ele queria ir.
 *
 * Usa sessionStorage (não localStorage) porque o returnTo deve ser efêmero:
 * vale apenas para a sessão atual do navegador, evitando redirecionamentos
 * estranhos dias depois.
 */

const KEY = "analiso_return_to";

/** Rotas para as quais nunca devemos redirecionar após login. */
const BLOCKED_PREFIXES = ["/login", "/api"];

function isSafeReturnTo(path: string): boolean {
  // Deve ser um path interno (começando com "/" e não "//" para evitar open-redirect)
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (BLOCKED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`))) {
    return false;
  }
  return true;
}

export function saveReturnTo(path: string): void {
  if (typeof window === "undefined") return;
  if (!isSafeReturnTo(path)) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // ignore storage errors
  }
}

/**
 * Lê o returnTo. Prioriza a query string (?returnTo=...) pois é a fonte mais
 * recente e explícita; faz fallback para sessionStorage (sobrevive a reloads
 * do /login). Retorna null se não houver destino válido.
 */
export function readReturnTo(searchParams?: URLSearchParams | null): string | null {
  if (typeof window === "undefined") return null;

  const fromQuery = searchParams?.get("returnTo") ?? null;
  if (fromQuery && isSafeReturnTo(fromQuery)) return fromQuery;

  try {
    const fromStorage = sessionStorage.getItem(KEY);
    if (fromStorage && isSafeReturnTo(fromStorage)) return fromStorage;
  } catch {
    // ignore storage errors
  }
  return null;
}

export function clearReturnTo(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore storage errors
  }
}
