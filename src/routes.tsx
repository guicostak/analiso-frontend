import { createBrowserRouter } from "react-router-dom";
import { Dashboard } from "./components/dashboard";
import { CompanyAnalysis } from "./components/company-analysis";
import { ExplorePage } from "./components/explore";
import { LandingPage } from "./components/landing";
import { DemoPage } from "./components/demo-page";
import { LoginPage } from "./components/auth/login-page";
import { OnboardingPage } from "./components/onboarding/onboarding-page";
import { WatchlistPage } from "./components/watchlist";
import { ComparePage } from "./components/compare-page";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/demo",
    element: <DemoPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/explorar",
    element: (
      <ProtectedRoute>
        <ExplorePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/watchlist",
    element: (
      <ProtectedRoute>
        <WatchlistPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/comparar",
    element: (
      <ProtectedRoute>
        <ComparePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/empresa/:ticker",
    element: (
      <ProtectedRoute>
        <CompanyAnalysis />
      </ProtectedRoute>
    ),
  },
]);
