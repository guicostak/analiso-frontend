import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

/**
 * Decodes the payload of a JWT without verifying the signature.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Proxy for /api/auth/verification/send.
 * Rejects requests from Google-authenticated users before forwarding to the backend.
 *
 * Detection strategy: the JWT payload is inspected for a `provider` claim.
 * If the claim equals "google", the request is rejected with 403.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload?.provider === "google") {
      return NextResponse.json(
        { message: "Verificação de e-mail não está disponível para contas Google." },
        { status: 403 },
      );
    }
  }

  // Forward to the actual backend
  const body = await req.text();

  const upstream = await fetch(`${API_BASE_URL}/api/auth/verification/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body,
  });

  const responseBody = await upstream.text();

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
