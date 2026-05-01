import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl, fetchWithLogging } from '../config/api';
import { Shield, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetchWithLogging(getApiUrl('/api/user/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });

      const res = await response.json();
      if (response.ok) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_profile', JSON.stringify(res.data.user));
        
        // --- SEAMLESS INSTITUTIONAL REDIRECT ---
        const userId = res.data.user.id;
        window.location.href = getApiUrl(`/api/auth/bybit/authorize?userId=${userId}`);
      } else {
        setError(res.error?.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <div className="auth-overlay"></div>
      
      <div className="auth-container">
        <div className="premium-card auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Shield className="logo-icon" size={32} />
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the MesoflixLabs institutional network</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-field-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Ex: John Carter" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Work Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="auth-error-pill">
                <span className="error-dot"></span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`auth-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Open Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already registered?</span>
            <Link to="/sign-in" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-page-root {
          min-height: 100vh;
          background: #060a14;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 40px 20px;
        }

        .auth-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .auth-container {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 10;
        }

        .auth-card {
          text-align: center;
        }

        .auth-header {
          margin-bottom: 40px;
        }

        .auth-logo {
          width: 64px;
          height: 64px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .auth-title {
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          text-align: left;
        }

        .input-field-group label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #475569;
        }

        .input-wrapper input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 14px 16px 14px 48px;
          color: #fff;
          font-size: 15px;
          transition: all 0.2s;
          outline: none;
        }

        .input-wrapper input:focus {
          border-color: #10b981;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
        }

        .auth-error-pill {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ff8282;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
        }

        .auth-submit-btn {
          background: linear-gradient(135deg, #3b82f6, #10b981);
          color: #000;
          border: none;
          padding: 16px;
          border-radius: 16px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
        }

        .auth-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.3);
          filter: brightness(1.1);
        }

        .auth-submit-btn:active {
          transform: translateY(0);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .auth-footer {
          margin-top: 32px;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-link {
          color: #10b981;
          font-weight: 700;
          text-decoration: none;
          transition: 0.2s;
        }

        .auth-link:hover {
          color: #3b82f6;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
}

export default SignUp;
