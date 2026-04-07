import React, { useState } from 'react';

const faqs = [
  {
    q: 'How do I create a MesoflixLabs account?',
    a: 'Click "Sign Up" on the top right corner, enter your email and password, verify your email, then complete the KYC process. You\'ll be trading within minutes.',
  },
  {
    q: 'Is MesoflixLabs safe?',
    a: 'Yes. We are an official Bybit registered broker with 100% cold storage for crypto assets, 2FA authentication, and insurance fund protection on all accounts.',
  },
  {
    q: 'What fees does MesoflixLabs charge?',
    a: 'We charge a flat 0.10% maker/taker fee for standard accounts. Pro and Elite tiers get reduced rates. See our Buy/Sell page for the full fee schedule.',
  },
  {
    q: 'How long do withdrawals take?',
    a: 'Crypto withdrawals typically process within 10-30 minutes. Fiat withdrawals (bank transfer) take 1-3 business days depending on your country.',
  },
  {
    q: 'What cryptocurrencies can I trade?',
    a: 'We support 300+ trading pairs via Bybit, including BTC, ETH, SOL, ADA, DOT, and hundreds more. Check our Markets page for the full list.',
  },
  {
    q: 'Does MesoflixLabs have a mobile app?',
    a: 'Our mobile app is currently in development (Q3 2026 launch). For now, our platform is fully responsive and works great on mobile browsers.',
  },
  {
    q: 'How does Bybit integration work?',
    a: 'MesoflixLabs acts as a registered Bybit broker. Your account is linked to Bybit\'s infrastructure for trade execution and liquidity — but you manage everything through MesoflixLabs.',
  },
  {
    q: 'Can I use leverage trading?',
    a: 'Yes, through our Ecosystem integration with Bybit, qualified users can access leveraged futures positions. Please note leverage trading carries significant risk.',
  },
];

const supportChannels = [
  { icon: '📧', title: 'Email Support', desc: 'Detailed technical and account support. Typically respond within 4 hours.', action: 'support@mesoflixlabs.com', type: 'email' },
  { icon: '📚', title: 'Help Center', desc: 'Browse 200+ articles, tutorials, and guides in our self-service knowledge base.', action: 'Browse Docs', type: 'docs' },
  { 
    icon: '🌐', 
    title: 'Community', 
    desc: 'Join our official channels for market updates, product launches, and community support.', 
    links: [
      { label: 'Telegram Channel', url: 'https://t.me/mesoflix_labs' },
      { label: 'WhatsApp Channel', url: 'https://whatsapp.com/channel/0029VbCDAG6Gk1FsJYHwbo0a' },
      { label: 'WhatsApp Group', url: 'https://whatsapp.com/channel/0029VbCDAG6Gk1FsJYHwbo0a' } // Placeholder for now, user did not provide a separate link.
    ],
    type: 'community' 
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-open' : ''}`}>
      <button className="faq-question flex items-center justify-between w-full" onClick={() => setOpen(!open)}>
        <span className="text-base">{faq.q}</span>
        <span className="faq-icon">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="faq-answer text text-base">{faq.a}</div>}
    </div>
  );
}

function Support() {
  const initialState = { name: '', email: '', accountEmail: '', subject: '', message: '' };
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setFormState(s => ({ ...s, [e.target.name]: e.target.value }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Front-end validation per PRD
    if (!formState.name || !formState.email || !formState.subject || !formState.message) {
      setError('Please fill out all required fields.');
      return;
    }
    if (formState.message.trim().length < 10) {
      setError('Message must be at least 10 characters long.');
      return;
    }
    
    setLoading(true);

    const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:3001' 
    : ''; // Use relative paths in production

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Unable to process your request at the moment. Please try again later.');
      }
    } catch (err) {
      console.error('Contact submit error', err);
      setError('Network error. Unable to process your request at the moment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormState(initialState);
    setSubmitted(false);
    setError('');
  };

  return (
    <div className="inner-page support-page">
      {/* Hero */}
      <section className="page-hero-inner flex items-center justify-center text-center">
        <div className="container">
          <div className="inner-hero-badge">Support Center</div>
          <h1 className="inner-hero-title">We're Here to<br /><span className="gradient-text">Help You</span></h1>
          <p className="text text-base inner-hero-desc">24/7 professional support for all your trading needs — from account setup to advanced API integrations.</p>
        </div>
      </section>

      {/* Support Channels */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="large-title">How Can We Help?</h2>
            <p className="text text-base">Choose the support channel that works best for you</p>
          </div>
          <div className="support-channels-grid">
            {supportChannels.map((ch, i) => (
              <div key={i} className={`support-channel-card ${i === 0 ? 'support-card-featured' : ''}`}>
                <div className="support-ch-icon">{ch.icon}</div>
                <h3 className="support-ch-title">{ch.title}</h3>
                <p className="text text-base">{ch.desc}</p>
                {ch.type === 'email' ? (
                  <a href={`mailto:${ch.action}`} className="btn btn-g-blue-veronica btn-base text-base" style={{ marginTop: '24px' }}>
                    Send Email
                  </a>
                ) : ch.type === 'community' ? (
                  <div className="flex flex-column" style={{ gap: '12px', marginTop: '24px' }}>
                    {ch.links.map((link, j) => (
                      <a key={j} href={link.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline text-base w-full">
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <button className="btn btn-outline text-base" style={{ marginTop: '24px' }}>{ch.action}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Support Form */}
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="sc-two-content">
            <div className="sc-two-left">
              <div className="section-badge" style={{ marginBottom: '16px' }}>Contact Form</div>
              <h2 className="large-title">Send Us a Message</h2>
              <p className="text text-base" style={{ marginBottom: '32px' }}>
                Fill in the form and our support team will get back to you via email — typically within 4 business hours.
              </p>
              <div className="support-info-list" style={{ marginTop: '0' }}>
                {[
                  { 
                    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>, 
                    label: 'Email', value: 'support@mesoflixlabs.com' 
                  },
                  { 
                    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, 
                    label: 'Response Time', value: '< 4 hours' 
                  },
                  { 
                    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, 
                    label: 'Languages', value: 'English, Swahili, French' 
                  },
                  { 
                    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>, 
                    label: 'Secure', value: 'All conversations encrypted' 
                  },
                ].map((item, i) => (
                  <div key={i} className="support-info-item flex items-center">
                    <div className="support-info-icon flex items-center justify-center">{item.icon}</div>
                    <div className="support-info-content">
                      <span className="info-label text-gray text-base">{item.label}</span>
                      <span className="info-value text-white text-base">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            <div className="sc-two-right">
              {submitted ? (
                <div className="support-success-card text-center">
                  <div className="success-icon">✅</div>
                  <h3 className="support-success-title">Message Received!</h3>
                  <p className="text text-base">Your request has been received. Our support team will respond within 24 hours at <strong>{formState.email}</strong>.</p>
                  <button className="btn btn-outline text-base" style={{ marginTop: '24px' }} onClick={resetForm}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="support-form" onSubmit={handleSubmit}>
                  {error && <div style={{ color: '#FF6B6B', background: 'rgba(255, 107, 107, 0.1)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(255,107,107,0.3)' }}>{error}</div>}
                  
                  <div className="support-form-row">
                    <div className="support-field">
                      <label className="support-label text-gray text-base">Full Name *</label>
                      <input type="text" name="name" value={formState.name} onChange={handleChange} className="support-input" placeholder="Your full name" required />
                    </div>
                    <div className="support-field">
                      <label className="support-label text-gray text-base">Email Address *</label>
                      <input type="email" name="email" value={formState.email} onChange={handleChange} className="support-input" placeholder="for our reply" required />
                    </div>
                  </div>

                  <div className="support-form-row">
                    <div className="support-field">
                      <label className="support-label text-gray text-base">Account Email</label>
                      <input type="email" name="accountEmail" value={formState.accountEmail} onChange={handleChange} className="support-input" placeholder="If different (optional)" />
                    </div>
                    <div className="support-field">
                      <label className="support-label text-gray text-base">Subject *</label>
                      <select name="subject" value={formState.subject} onChange={handleChange} className="support-input" required>
                        <option value="">Select a category...</option>
                        <option>General Inquiry</option>
                        <option>Technical Issue</option>
                        <option>Billing</option>
                        <option>API / Integration</option>
                        <option>Account & Verification</option>
                        <option>Security Concern</option>
                      </select>
                    </div>
                  </div>

                  <div className="support-field">
                    <label className="support-label text-gray text-base">Message *</label>
                    <textarea name="message" value={formState.message} onChange={handleChange} className="support-input support-textarea" placeholder="Describe your issue in detail (min 10 chars)..." rows="6" required />
                  </div>
                  
                  <button type="submit" className="btn btn-g-blue-veronica btn-base text-base w-full" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-badge">FAQ</div>
            <h2 className="large-title">Frequently Asked Questions</h2>
            <p className="text text-base">Quick answers to the most common questions</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => <FAQItem key={i} faq={faq} />)}
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="section-padded section-dark-alt">
        <div className="container">
          <div className="system-status-card text-center">
            <div className="status-dot-green" />
            <h3 className="system-status-title">All Systems Operational</h3>
            <p className="text text-base">Trading Engine, API, Deposits & Withdrawals — all running normally.</p>
            <div className="status-services flex items-center justify-center">
              {['Trading API', 'WebSocket', 'Bybit Bridge', 'Auth Service', 'Withdrawals'].map((s, i) => (
                <div key={i} className="status-service-item flex items-center">
                  <span className="text-mint" style={{ marginRight: '6px' }}>●</span>
                  <span className="text-gray text-base">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Support;
