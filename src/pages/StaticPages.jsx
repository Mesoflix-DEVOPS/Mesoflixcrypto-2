import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="premium-page-wrap flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="container text-center" style={{ maxWidth: '600px' }}>
        <h1 className="hero-title"><span>404</span></h1>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Transmission Lost</h2>
        <p style={{ color: '#94a3b8', marginBottom: '40px' }}>
          We can't seem to find the page you're looking for. It might have been removed or renamed.
        </p>
        <Link to="/" className="job-btn" style={{ padding: '16px 40px' }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

function SimplePage({ badge, title, children }) {
  return (
    <div className="premium-page-wrap">
      <section className="premium-hero">
        <div className="container">
          <div className="hero-badge">{badge}</div>
          <h1 className="hero-title"><span>{title}</span></h1>
        </div>
      </section>
      <section className="premium-section">
        <div className="container">
          {children}
        </div>
      </section>
    </div>
  );
}

export function About() {
  const milestones = [
    { year: '2024', event: 'MesoflixLabs founded — vision to democratize crypto trading across Africa and beyond.' },
    { year: 'Q1 2025', event: 'Achieved official Bybit Broker certification — one of only 50 brokers in Africa.' },
    { year: 'Q3 2025', event: 'Secured seed funding, reached 50,000 registered users on beta platform.' },
    { year: 'Q1 2026', event: 'Full public launch — 300+ trading pairs, auto-bots, and portfolio management.' },
  ];

  return (
    <SimplePage badge="Our Story" title="About MesoflixLabs">
      <div className="about-intro text-center" style={{ maxWidth: '780px', margin: '0 auto 80px' }}>
        <p style={{ fontSize: '20px', lineHeight: '1.8', color: '#94a3b8' }}>
          MesoflixLabs was built on a simple idea: crypto trading should be accessible, transparent, and powerful for everyone — from first-time investors to professional traders.
        </p>
      </div>

      <div className="premium-card-grid">
        {[
          { icon: '🎯', title: 'Our Mission', desc: 'To make professional-grade crypto trading accessible to anyone, anywhere.' },
          { icon: '👁️', title: 'Our Vision', desc: 'A world where every person has equal access to financial markets.' },
          { icon: '💎', title: 'Our Values', desc: 'Transparency, security, and user empowerment in every trade.' },
        ].map((item, i) => (
          <div key={i} className="premium-card">
            <span className="card-icon">{item.icon}</span>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-text">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="section-header text-center" style={{ marginTop: '120px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: '950', marginBottom: '48px' }}>Our Journey</h2>
      </div>
      
      <div className="premium-timeline">
        {milestones.map((m, i) => (
          <div key={i} className="timeline-item">
            <div className="t-year">{m.year}</div>
            <div className="t-content">{m.event}</div>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export function Careers() {
  const openings = [
    { title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Product Designer', dept: 'Design', location: 'Nairobi / Remote', type: 'Full-time' },
    { title: 'Quantitative Analyst', dept: 'Trading', location: 'Remote', type: 'Full-time' },
    { title: 'Customer Success Lead', dept: 'Support', location: 'Remote', type: 'Full-time' },
  ];

  return (
    <SimplePage badge="Careers" title="Build the Future">
      <div className="premium-card-grid">
        {[
          { icon: '🌍', title: 'Remote First', desc: 'Work from anywhere in the world with flexible hours.' },
          { icon: '📈', title: 'Real Impact', desc: 'Help build infrastructure used by thousands of traders daily.' },
          { icon: '💰', title: 'Competitive Pay', desc: 'Market-rate salaries plus performance bonuses.' },
        ].map((b, i) => (
          <div key={i} className="premium-card">
            <span className="card-icon">{b.icon}</span>
            <h3 className="card-title">{b.title}</h3>
            <p className="card-text">{b.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '120px' }}>
        {openings.map((job, i) => (
          <div key={i} className="premium-job-card">
            <div className="job-info">
              <h3>{job.title}</h3>
              <div className="job-meta">
                <span>{job.dept}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.type}</span>
              </div>
            </div>
            <a href="mailto:careers@mesoflixlabs.com" className="job-btn">Apply Now</a>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export function Privacy() {
  return (
    <SimplePage badge="Legal" title="Privacy Policy">
      <div className="premium-legal">
        <span className="legal-date">Last updated: April 2026</span>
        {[
          { title: '1. Information We Collect', body: 'We collect information you provide directly to us, including: name, email address, government ID (for KYC), and transaction history.' },
          { title: '2. Data Security', body: 'We implement AES-256 encryption and cold storage for crypto assets, with regular security audits.' },
          { title: '3. Contact Us', body: 'Questions? Reach us at privacy@mesoflixlabs.com.' },
        ].map((section, i) => (
          <div key={i} className="legal-section">
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export function Terms() {
  return (
    <SimplePage badge="Legal" title="Terms of Service">
      <div className="premium-legal">
        <span className="legal-date">Last updated: April 2026</span>
        {[
          { title: '1. Acceptance of Terms', body: 'By accessing MesoflixLabs, you agree to be bound by these Terms of Service.' },
          { title: '2. Trading Risks', body: 'Cryptocurrency trading involves significant risk. Only trade with funds you can afford to lose.' },
          { title: '3. Bybit Relationship', body: 'MesoflixLabs operates as a registered Bybit broker. Trades are executed through Bybit infrastructure.' },
        ].map((section, i) => (
          <div key={i} className="legal-section">
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export function Press() {
  const pressItems = [
    { date: 'March 2026', outlet: 'TechCrunch Africa', title: 'MesoflixLabs Becomes First East African Bybit Broker' },
    { date: 'Feb 2026', outlet: 'CoinDesk', title: 'How MesoflixLabs Is Democratizing Crypto Trading' },
  ];

  return (
    <SimplePage badge="Press" title="In the News">
      <div className="premium-card-grid">
        {pressItems.map((item, i) => (
          <div key={i} className="premium-card">
            <div style={{ color: '#10b981', fontSize: '12px', fontWeight: '900', marginBottom: '12px' }}>{item.outlet}</div>
            <h3 className="card-title" style={{ fontSize: '18px' }}>{item.title}</h3>
            <div style={{ color: '#475569', fontSize: '12px', marginTop: '16px' }}>{item.date}</div>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export function News() {
  const articles = [
    { date: 'Apr 1, 2026', tag: 'Platform Update', title: 'MesoflixLabs v1.0 Officially Launches' },
    { date: 'Mar 28, 2026', tag: 'Market Insight', title: 'Bitcoin Breaks $56K — What It Means' },
  ];

  return (
    <SimplePage badge="News" title="Latest Updates">
      <div className="premium-card-grid">
        {articles.map((article, i) => (
          <div key={i} className="premium-card">
            <div style={{ color: '#10b981', fontSize: '12px', fontWeight: '900', marginBottom: '12px' }}>{article.tag}</div>
            <h3 className="card-title" style={{ fontSize: '18px' }}>{article.title}</h3>
            <div style={{ color: '#475569', fontSize: '12px', marginTop: '16px' }}>{article.date}</div>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export default NotFound;
