import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      if (response.data.status === 'MFA_REQUIRED') {
        setUserId(response.data.userId);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerify = async (imageSrc) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/verify-face', {
        userId,
        image: imageSrc
      });
      
      // Face matched, login user
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Face verification failed');
      // If it fails, let them try again by staying on step 2
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <p className="subtitle">Secure Login with Face MFA</p>

      {error && <div className="alert alert-error">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <Mail size={18} color="var(--text-muted)" style={{ marginLeft: '1rem' }} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ border: 'none', background: 'transparent' }} placeholder="john@example.com" />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <Lock size={18} color="var(--text-muted)" style={{ marginLeft: '1rem' }} />
              <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ border: 'none', background: 'transparent' }} placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Next'}
          </button>
        </form>
      ) : (
        <div>
          <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Please look at the camera to verify your identity.
          </p>
          
          {loading ? (
             <div style={{ textAlign: 'center', padding: '3rem 0' }}>
               <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
               <p>Verifying face biometrics...</p>
               <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
             </div>
          ) : (
            <WebcamCapture onCapture={handleFaceVerify} maxImages={1} buttonText="Verify Face" />
          )}

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button className="btn" style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.875rem' }} onClick={() => setStep(1)} disabled={loading}>
              Back to Password
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register</Link>
        </p>
      )}
    </div>
  );
};

export default Login;
