/**
 * Dashboard API service.
 * Types mirror the backend DashboardResponse DTO exactly.
 */

import { apiFetch } from "./api";

// -------------------------------------------------------
// Response types
// -------------------------------------------------------

export interface DashboardSummary {
  headline: string;
  body: string | null;
  ctaPrimary: string;
}

export interface DashboardNextStep {
  headline: string;
  body: string | null;
}

export interface DashboardSessionClosing {
  headline: string;
  body: string | null;
}

export interface DashboardCard {
  badge: string;
  title: string;
  whyItMatters: string;
  ctaLabel: string;
}

export interface DashboardDetail {
  entryReason: string;
  benefitNow: string;
}

export interface DashboardExtra {
  badge: string | null;
  line: string | null;
}

export interface DashboardItem {
  ticker: string;
  pillar: string;
  priorityScore: number;
  priorityRank: number;
  primaryTemplate: string;
  overlays: string[];
  card: DashboardCard;
  detail: DashboardDetail;
  extra: DashboardExtra;
}

export interface DashboardResponse {
  referenceDate: string;
  dayTemplate: string;
  summary: DashboardSummary;
  nextStep: DashboardNextStep;
  sessionClosing: DashboardSessionClosing;
  items: DashboardItem[];
  manifestVersion: string;
  renderedAt: string;
}

// -------------------------------------------------------
// Fetch
// -------------------------------------------------------

export async function getDashboard(
  token?: string | null,
): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/api/dashboard", {}, token);
}
