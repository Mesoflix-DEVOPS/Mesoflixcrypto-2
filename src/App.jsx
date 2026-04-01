import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BuySell from './pages/BuySell';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Main nav pages */}
          <Route index element={<Home />} />
          <Route path="buy-sell" element={<BuySell />} />
          <Route path="invest" element={<Invest />} />
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

          {/* Auth stubs */}
          <Route path="sign-in" element={<AuthStub type="signin" />} />
          <Route path="sign-up" element={<AuthStub type="signup" />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Temporary auth stub until auth pages are built
function AuthStub({ type }) {
  return (
    <div className="inner-page text-center" style={{ padding: '120px 0' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="inner-hero-badge">{type === 'signup' ? 'Get Started' : 'Welcome Back'}</div>
        <h1 className="inner-hero-title" style={{ fontSize: '48px', marginBottom: '16px' }}>
          {type === 'signup' ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="text text-base" style={{ marginBottom: '40px' }}>
          {type === 'signup'
            ? 'Full authentication coming soon. Share your email below to join the waitlist.'
            : 'Full authentication coming soon. Contact support for early access.'}
        </p>
        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="email" className="support-input" placeholder="Email address" style={{ textAlign: 'center' }} />
          {type === 'signup' && <input type="password" className="support-input" placeholder="Choose a password" style={{ textAlign: 'center' }} />}
          <button type="submit" className="btn btn-g-blue-veronica btn-base text-base">
            {type === 'signup' ? 'Join Waitlist' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
