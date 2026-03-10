import { createBrowserRouter } from 'react-router-dom';
import { Dashboard } from './components/dashboard';
import { CompanyAnalysis } from './components/company-analysis';
import { ExplorePage } from './components/explore';
import { LandingPage } from './components/landing';
import { DemoPage } from './components/demo-page';
import { LoginPage } from './components/auth/login-page';
import { OnboardingPage } from './components/onboarding/onboarding-page';
import { WatchlistPage } from './components/watchlist';
import { ComparePage } from './components/compare-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/demo',
    element: <DemoPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/explorar',
    element: <ExplorePage />,
  },
  {
    path: '/watchlist',
    element: <WatchlistPage />,
  },
  {
    path: '/comparar',
    element: <ComparePage />,
  },
  {
    path: '/empresa/:ticker',
    element: <CompanyAnalysis />,
  },
]);
