import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ScannerPage = lazy(() => import('./pages/ScannerPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ImpactPage = lazy(() => import('./pages/ImpactPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="scan" element={<ScannerPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="company" element={<CompanyDashboard />} />
            <Route path="customer" element={<UserDashboard />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="impact" element={<ImpactPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App;
