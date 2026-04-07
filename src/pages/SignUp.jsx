import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      const API_BASE_URL = import.meta.env.MODE === 'development' 
        ? 'http://localhost:3001' 
        : 'https://mesoflixcrypto-2.onrender.com';
        
      const response = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_profile', JSON.stringify(data.user));
        navigate('/broker/api/test'); // Redirect to connectivity hub
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inner-page flex items-center justify-center" style={{ padding: '100px 24px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="auth-card" style={{ 
          background: 'rgba(10, 10, 26, 0.8)', 
          border: '1px solid #1a1a3a', 
          padding: '40px', 
          borderRadius: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="text-center mb-10">
            <div className="inner-hero-badge" style={{ marginBottom: '16px' }}>Join MesoflixLabs</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Create Account</h1>
            <p style={{ color: '#888', fontSize: '14px' }}>Start your institutional trading journey today.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="tester-input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="support-input" 
                placeholder="Ex: John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="tester-input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="support-input" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="tester-input-group">
              <label>Password</label>
              <input 
                type="password" 
                className="support-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div style={{ color: '#ff8282', fontSize: '12px', textAlign: 'center' }}>{error}</div>}

            <button 
              type="submit" 
              className="btn btn-g-blue-veronica btn-base text-base" 
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Open Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '14px' }}>
            Already have an account? <Link to="/sign-in" style={{ color: '#00A3FF', fontWeight: '700' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
