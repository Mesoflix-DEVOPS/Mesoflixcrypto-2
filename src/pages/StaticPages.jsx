import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="inner-page flex items-center justify-center" style={{ minHeight: '80vh', padding: '60px 0' }}>
      <div className="container text-center" style={{ maxWidth: '600px' }}>
        <img 
          src="https://illustrations.popsy.co/amber/page-not-found.svg" 
          alt="Page Not Found" 
          style={{ width: '100%', maxWidth: '350px', margin: '0 auto 32px' }} 
        />
        <h1 className="large-title" style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px' }}>
          <span className="gradient-text">Oops!</span> Page Not Found
        </h1>
        <p className="text text-base" style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '40px' }}>
          We can't seem to find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
        </p>
        <Link to="/" className="btn btn-g-blue-veronica btn-base text-base" style={{ padding: '16px 32px' }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

function SimplePage({ badge, title, children }) {
  return (
    <div className="inner-page">
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge">{badge}</div>
          <h1 className="inner-hero-title">{title}</h1>
        </div>
      </section>
      <section className="section-padded">
        <div className="container simple-page-content">
          {children}
        </div>
      </section>
    </div>
  );
}

export function About() {
  const team = [
    { name: 'Alex Morgan', role: 'CEO & Co-Founder', bio: 'Former Head of Trading at two leading crypto exchanges with 12+ years in fintech.' },
    { name: 'Sarah Kimani', role: 'CTO', bio: 'Systems architect with deep expertise in high-frequency trading engines and real-time infrastructure.' },
    { name: 'David Osei', role: 'Head of Compliance', bio: 'Regulatory expert with background in financial law across East Africa and Europe.' },
    { name: 'Priya Nair', role: 'Head of Design', bio: 'Product designer who has built trading interfaces used by millions of users globally.' },
  ];
  const milestones = [
    { year: '2024', event: 'MesoflixLabs founded — vision to democratize crypto trading across Africa and beyond.' },
    { year: 'Q1 2025', event: 'Achieved official Bybit Broker certification — one of only 50 brokers in Africa.' },
    { year: 'Q3 2025', event: 'Secured seed funding, reached 50,000 registered users on beta platform.' },
    { year: 'Q1 2026', event: 'Full public launch — 300+ trading pairs, auto-bots, and portfolio management.' },
  ];

  return (
    <SimplePage badge="Our Story" title={<>About <span className="gradient-text">MesoflixLabs</span></>}>
      <div className="about-intro text-center" style={{ maxWidth: '780px', margin: '0 auto 80px' }}>
        <p className="text text-base" style={{ fontSize: '20px', lineHeight: '1.8' }}>
          MesoflixLabs was built on a simple idea: crypto trading should be accessible, transparent, and powerful for everyone — from first-time investors to professional traders. As an official Bybit registered broker, we bridge the gap between institutional trading infrastructure and everyday users.
        </p>
      </div>

      <div className="about-mission-grid">
        {[
          { icon: '🎯', title: 'Our Mission', desc: 'To make professional-grade crypto trading accessible to anyone, anywhere — with no compromises on security, speed, or transparency.' },
          { icon: '👁️', title: 'Our Vision', desc: 'A world where every person has equal access to financial markets and the tools to grow their wealth through crypto trading.' },
          { icon: '💎', title: 'Our Values', desc: 'Transparency, security, user empowerment, continuous innovation, and building lasting trust with every trade.' },
        ].map((item, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{item.icon}</div>
            <h3 className="feature-card-title">{item.title}</h3>
            <p className="text text-base">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="section-header text-center" style={{ marginTop: '80px' }}>
        <h2 className="large-title">Our Journey</h2>
      </div>
      <div className="roadmap-timeline">
        {milestones.map((m, i) => (
          <div key={i} className="roadmap-item done">
            <div className="roadmap-dot" />
            <div className="roadmap-content">
              <div className="roadmap-quarter text-lavender text-base">{m.year}</div>
              <p className="text text-base">{m.event}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header text-center" style={{ marginTop: '80px' }}>
        <h2 className="large-title">Meet the Team</h2>
      </div>
      <div className="team-grid">
        {team.map((member, i) => (
          <div key={i} className="team-card text-center">
            <div className="team-avatar">{member.name.split(' ').map(n => n[0]).join('')}</div>
            <h3 className="team-name">{member.name}</h3>
            <div className="team-role text-lavender text-base">{member.role}</div>
            <p className="text text-base">{member.bio}</p>
          </div>
        ))}
      </div>

      <div className="cta-section text-center" style={{ marginTop: '80px' }}>
        <h2 className="large-title">Join us on our mission</h2>
        <p className="text text-base">See our open positions and help shape the future of crypto trading</p>
        <Link to="/careers" className="btn btn-g-blue-veronica btn-base text-base" style={{ marginTop: '24px' }}>View Careers</Link>
      </div>
    </SimplePage>
  );
}

export function Careers() {
  const openings = [
    { title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Product Designer', dept: 'Design', location: 'Nairobi / Remote', type: 'Full-time' },
    { title: 'Quantitative Analyst', dept: 'Trading', location: 'Remote', type: 'Full-time' },
    { title: 'Community Manager', dept: 'Marketing', location: 'Remote', type: 'Part-time' },
    { title: 'Compliance Officer', dept: 'Legal', location: 'Nairobi', type: 'Full-time' },
    { title: 'Customer Success Lead', dept: 'Support', location: 'Remote', type: 'Full-time' },
  ];

  return (
    <SimplePage badge="Careers" title={<>Build the Future of<br /><span className="gradient-text">Crypto with Us</span></>}>
      <div className="about-intro text-center" style={{ maxWidth: '680px', margin: '0 auto 64px' }}>
        <p className="text text-base" style={{ fontSize: '18px', lineHeight: '1.8' }}>We're a remote-first team passionate about making crypto trading accessible to the world. If you're motivated by meaningful work and love cutting-edge technology, we want to hear from you.</p>
      </div>

      <div className="about-mission-grid">
        {[
          { icon: '🌍', title: 'Remote First', desc: 'Work from anywhere in the world with flexible hours that fit your lifestyle.' },
          { icon: '📈', title: 'Real Impact', desc: 'Help build infrastructure used by hundreds of thousands of active traders daily.' },
          { icon: '💰', title: 'Competitive Pay', desc: 'Market-rate salaries plus token allocations and performance bonuses.' },
        ].map((b, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{b.icon}</div>
            <h3 className="feature-card-title">{b.title}</h3>
            <p className="text text-base">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="section-header text-center" style={{ marginTop: '80px', marginBottom: '40px' }}>
        <h2 className="large-title">Open Positions</h2>
      </div>
      <div className="job-listings">
        {openings.map((job, i) => (
          <div key={i} className="job-card flex items-center justify-between">
            <div className="job-info">
              <h3 className="job-title">{job.title}</h3>
              <div className="job-meta flex items-center">
                <span className="job-dept text-lavender text-base">{job.dept}</span>
                <span className="job-sep text-gray">·</span>
                <span className="text-gray text-base">{job.location}</span>
                <span className="job-sep text-gray">·</span>
                <span className="text-gray text-base">{job.type}</span>
              </div>
            </div>
            <a href="mailto:careers@mesoflixlabs.com" className="btn btn-outline text-base">Apply Now</a>
          </div>
        ))}
      </div>

      <div className="cta-section text-center" style={{ marginTop: '80px' }}>
        <p className="text text-base">Don't see a role? Send your CV to <a href="mailto:careers@mesoflixlabs.com" className="text-lavender">careers@mesoflixlabs.com</a></p>
      </div>
    </SimplePage>
  );
}

export function Privacy() {
  return (
    <SimplePage badge="Legal" title={<>Privacy <span className="gradient-text">Policy</span></>}>
      <div className="legal-content">
        <p className="text text-base legal-updated">Last updated: April 1, 2026</p>
        {[
          { title: '1. Information We Collect', body: 'We collect information you provide directly to us, such as when you create an account, make a trade, or contact us for support. This includes: name, email address, government ID (for KYC), wallet addresses, transaction history, and device/browser information.' },
          { title: '2. How We Use Your Information', body: 'We use the information we collect to provide and improve our services, process transactions, send you technical notices and support messages, respond to your comments, and comply with legal obligations and regulatory requirements.' },
          { title: '3. Information Sharing', body: 'We share your information with Bybit (our broker partner) for trade execution and compliance purposes, service providers who perform services on our behalf, law enforcement as required by law, and with your consent for any other purpose.' },
          { title: '4. Data Security', body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes AES-256 encryption, cold storage for crypto assets, and regular security audits.' },
          { title: '5. Your Rights', body: 'You have the right to access, update, or delete your personal information. You may request this by contacting our support team. Certain information may be retained as required by legal and regulatory obligations.' },
          { title: '6. Cookies', body: 'We use cookies and similar tracking technologies to track activity on our platform and hold certain information to improve your experience. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.' },
          { title: '7. Contact Us', body: 'If you have any questions about this Privacy Policy, please contact us at privacy@mesoflixlabs.com.' },
        ].map((section, i) => (
          <div key={i} className="legal-section">
            <h3 className="legal-section-title">{section.title}</h3>
            <p className="text text-base">{section.body}</p>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export function Terms() {
  return (
    <SimplePage badge="Legal" title={<>Terms of <span className="gradient-text">Service</span></>}>
      <div className="legal-content">
        <p className="text text-base legal-updated">Last updated: April 1, 2026</p>
        {[
          { title: '1. Acceptance of Terms', body: 'By accessing and using MesoflixLabs, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our platform.' },
          { title: '2. Eligibility', body: 'You must be at least 18 years of age to use MesoflixLabs. By using our platform, you represent that you are of legal age in your jurisdiction and have the legal capacity to enter into binding agreements.' },
          { title: '3. Account Responsibilities', body: 'You are responsible for maintaining the security of your account and password. MesoflixLabs shall not be liable for any loss or damage arising from your failure to comply with this security obligation.' },
          { title: '4. Trading Risks', body: 'Cryptocurrency trading involves significant risk. Prices are volatile and can move dramatically in short periods. Past performance is not indicative of future results. You should only trade with funds you can afford to lose.' },
          { title: '5. Bybit Broker Relationship', body: 'MesoflixLabs operates as a registered Bybit broker. By trading on our platform, you agree to Bybit\'s terms of service in addition to these terms, as your trades are executed through Bybit\'s infrastructure.' },
          { title: '6. Prohibited Activities', body: 'You agree not to engage in market manipulation, money laundering, using the platform to fund illegal activities, creating multiple accounts to circumvent restrictions, or any other activity that violates applicable laws.' },
          { title: '7. Limitation of Liability', body: 'MesoflixLabs shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service, even if we have been advised of the possibility of such damages.' },
          { title: '8. Governing Law', body: 'These Terms shall be governed by the laws of the jurisdiction in which MesoflixLabs is incorporated, without regard to its conflict of law provisions.' },
        ].map((section, i) => (
          <div key={i} className="legal-section">
            <h3 className="legal-section-title">{section.title}</h3>
            <p className="text text-base">{section.body}</p>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export function Press() {
  const pressItems = [
    { date: 'March 2026', outlet: 'TechCrunch Africa', title: 'MesoflixLabs Becomes First East African Bybit Broker', desc: 'The platform achieved official Bybit broker status, expanding access to institutional-grade crypto infrastructure across Africa.' },
    { date: 'Feb 2026', outlet: 'CoinDesk', title: 'How MesoflixLabs Is Democratizing Crypto Trading', desc: 'A deep dive into how the startup is breaking down barriers for first-time and professional traders alike.' },
    { date: 'Jan 2026', outlet: 'African Business', title: 'Fintech Startup MesoflixLabs Secures Seed Funding', desc: 'MesoflixLabs closed its seed round to accelerate growth across East Africa and expand its technology team.' },
  ];

  return (
    <SimplePage badge="Press" title={<>In the <span className="gradient-text">News</span></>}>
      <div className="press-grid">
        {pressItems.map((item, i) => (
          <div key={i} className="press-card">
            <div className="press-meta flex items-center justify-between">
              <span className="press-outlet text-lavender text-base">{item.outlet}</span>
              <span className="press-date text-gray text-base">{item.date}</span>
            </div>
            <h3 className="press-title">{item.title}</h3>
            <p className="text text-base">{item.desc}</p>
            <a href="mailto:press@mesoflixlabs.com" className="btn btn-outline text-base" style={{ marginTop: '24px' }}>Read Full Story</a>
          </div>
        ))}
      </div>
      <div className="press-contact text-center" style={{ marginTop: '80px' }}>
        <h2 className="large-title">Press Inquiries</h2>
        <p className="text text-base">For media inquiries, interviews, and press kits, contact:</p>
        <a href="mailto:press@mesoflixlabs.com" className="text-lavender" style={{ fontSize: '20px' }}>press@mesoflixlabs.com</a>
      </div>
    </SimplePage>
  );
}

export function News() {
  const articles = [
    { date: 'Apr 1, 2026', tag: 'Platform Update', title: 'MesoflixLabs v1.0 Officially Launches', desc: 'Our full public launch brings 300+ trading pairs, auto-bots, and advanced portfolio management to traders worldwide.' },
    { date: 'Mar 28, 2026', tag: 'Market Insight', title: 'Bitcoin Breaks $56K — What It Means for Traders', desc: 'Our analysts break down the current BTC rally and how MesoflixLabs users can position themselves advantageously.' },
    { date: 'Mar 20, 2026', tag: 'Education', title: 'Understanding Leverage: A Guide for Beginners', desc: 'Leverage can amplify your gains — but also your losses. Learn how to use it responsibly on the Bybit platform.' },
    { date: 'Mar 10, 2026', tag: 'Feature', title: 'Introducing Portfolio Analytics on MesoflixLabs', desc: 'Track your performance, P&L, win rate, and drawdown all in one place with our new analytics dashboard.' },
  ];

  return (
    <SimplePage badge="News" title={<>Latest <span className="gradient-text">Updates</span></>}>
      <div className="news-grid">
        {articles.map((article, i) => (
          <div key={i} className="news-card">
            <div className="news-meta flex items-center justify-between">
              <span className="news-tag text-lavender text-base">{article.tag}</span>
              <span className="news-date text-gray text-base">{article.date}</span>
            </div>
            <h3 className="news-title">{article.title}</h3>
            <p className="text text-base">{article.desc}</p>
            <button className="btn btn-outline text-base" style={{ marginTop: '24px' }}>Read More</button>
          </div>
        ))}
      </div>
    </SimplePage>
  );
}

export default NotFound;
