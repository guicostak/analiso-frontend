// ── Request DTOs (espelham o backend) ─────────────────────────────────────────

export interface EmailRegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface EmailAuthResponse {
  accessToken: string;
  tokenType: string;
  isNewUser: boolean;
  user: {
    id: number;
    email: string;
    name: string;
    avatarUrl: string;
  };
}

// ── UI Models ─────────────────────────────────────────────────────────────────

export interface EmailAuthUser {
  id: number;
  email: string;
  name: string;
  picture: string;
  token: string;
  isNewUser: boolean;
}

export type AuthMode = "login" | "register";
