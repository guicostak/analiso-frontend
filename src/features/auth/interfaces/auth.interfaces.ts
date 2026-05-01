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

export interface SendVerificationRequest {
  target: string;
  channel: "email";
}

export interface VerifyCodeRequest {
  target: string;
  channel: "email";
  code: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface EmailAuthResponse {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds. Used by the client to schedule refresh. */
  expiresIn: number;
  tokenType: string;
  isNewUser: boolean;
  user: {
    id: number;
    email: string;
    name: string;
    avatarUrl: string;
    emailVerified: boolean;
  };
}

// ── UI Models ─────────────────────────────────────────────────────────────────

export interface EmailAuthUser {
  id: number;
  email: string;
  name: string;
  picture: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser: boolean;
}

export type AuthMode = "login" | "register";
