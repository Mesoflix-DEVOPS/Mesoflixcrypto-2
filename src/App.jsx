import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AuthComplete from './pages/AuthComplete';
import AuthError from './pages/AuthError';
import Invest from './pages/Invest';
import Market from './pages/Market';
import Ecosystem from './pages/Ecosystem';
import Support from './pages/Support';
import {
  About,
  Careers,
  Privacy,
  Terms,
  Press,
  News,
  NotFound,
} from './pages/StaticPages';
import BybitDashboard from './pages/BybitDashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import InstitutionalMarkets from './pages/InstitutionalMarkets';
import BybitRelay from './pages/BybitRelay';
import DashboardLayout from './components/DashboardLayout';
import BotTrading from './pages/BotTrading';

import { UserProvider, ProtectedRoute } from './components/AuthContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <SocketProvider>
          <Routes>
          <Route path="/" element={<Layout />}>
            {/* Main nav pages */}
            <Route index element={<Home />} />
            <Route path="auth/complete" element={<AuthComplete />} />
            <Route path="auth/error" element={<AuthError />} />
            <Route path="invest" element={<ProtectedRoute><Invest /></ProtectedRoute>} />
            <Route path="market" element={<Market />} />
            <Route path="ecosystem" element={<Ecosystem />} />
            <Route path="support" element={<Support />} />
            
            {/* Footer pages */}
            <Route path="about" element={<About />} />
            <Route path="careers" element={<Careers />} />
            <Route path="press" element={<Press />} />
            <Route path="news" element={<News />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="biometrics-privacy" element={<Privacy />} />
            <Route path="financial-policy" element={<Terms />} />
            <Route path="trading-terms" element={<Terms />} />

            {/* Live auth pages */}
            <Route path="sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<SignUp />} />

            {/* Institutional Relay (Catch messy Bybit links) */}
            <Route path="callback/bybit" element={<BybitRelay />} />
            <Route path="api/auth/bybit/callback" element={<BybitRelay />} />
          </Route>

          {/* --- Institutional Dashboard Branch --- */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<BybitDashboard />} />
            <Route path="markets" element={<InstitutionalMarkets />} />
            <Route path="trade" element={<BybitDashboard />} />
            <Route path="portfolio" element={<BybitDashboard />} /> 
            <Route path="analytics" element={<BybitDashboard />} /> 
            <Route path="orders" element={<BybitDashboard />} /> 
            <Route path="bots" element={<BotTrading />} />
            <Route path="config" element={<BybitDashboard />} />
            <Route path="settings" element={<BybitDashboard />} />
            <Route path="help" element={<BybitDashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </SocketProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
