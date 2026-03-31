import { NextRequest, NextResponse } from "next/server";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SuggestResult {
  ticker:      string;
  companyName: string;
  exchange:    string;
  type:        string;
}

interface BackendItem {
  ticker:      string;
  companyName: string;
}

interface BackendSearchResponse {
  items: BackendItem[];
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreResult(ticker: string, companyName: string, query: string): number {
  const q = query.toLowerCase();
  const t = ticker.toLowerCase();
  const n = companyName.toLowerCase();

  if (t === q)         return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q))   return 60;
  if (n.startsWith(q)) return 40;
  if (n.includes(q))   return 20;
  return 0;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q     = searchParams.get("q");
  const limit = searchParams.get("limit");

  // Validações
  if (!q || typeof q !== "string") {
    return NextResponse.json({ error: "query obrigatória" }, { status: 400 });
  }
  if (q.trim().length === 0) {
    return NextResponse.json({ results: [], query: q, total: 0 });
  }
  if (q.length > 50) {
    return NextResponse.json({ error: "query muito longa" }, { status: 400 });
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 20);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

  try {
    // Busca no backend com margem maior para poder re-ranquear
    const backendUrl = `${API_BASE}/api/search?query=${encodeURIComponent(q.trim())}&size=${safeLimit * 3}`;
    const res = await fetch(backendUrl, {
      headers: { "Content-Type": "application/json" },
      // Cache curto para autocomplete responsivo
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`Backend respondeu ${res.status}`);
    }

    const data: BackendSearchResponse = await res.json();

    const results: SuggestResult[] = (data.items ?? [])
      .map((item) => ({
        ticker:      item.ticker,
        companyName: item.companyName,
        exchange:    "BOVESPA",
        type:        "stock",
        _score:      scoreResult(item.ticker, item.companyName, q.trim()),
      }))
      .filter((item) => item._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, safeLimit)
      .map(({ ticker, companyName, exchange, type }) => ({
        ticker,
        companyName,
        exchange,
        type,
      }));

    return NextResponse.json({ results, query: q, total: results.length });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar sugestões" },
      { status: 502 },
    );
  }
}
