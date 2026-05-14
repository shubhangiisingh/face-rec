import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import WebcamCapture from '../components/WebcamCapture';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setError('');
    setStep(2);
  };

  const handleCapture = (capturedImages) => {
    setImages(capturedImages);
  };

  const handleSubmit = async () => {
    if (images.length < 5) {
      return setError('Please capture all required face images');
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        images
      });
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p className="subtitle">MFA with Face Recognition</p>

      {error && <div className="alert alert-error">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleNextStep}>
          <div className="form-group">
            <label>Full Name</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <User size={18} color="var(--text-muted)" style={{ marginLeft: '1rem' }} />
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ border: 'none', background: 'transparent' }} placeholder="John Doe" />
            </div>
          </div>
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
          <div className="form-group">
            <label>Confirm Password</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <ShieldCheck size={18} color="var(--text-muted)" style={{ marginLeft: '1rem' }} />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={{ border: 'none', background: 'transparent' }} placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem' }}>
            Next: Register Face
          </button>
        </form>
      ) : (
        <div>
          <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Please capture 5 images of your face. Move slightly between shots for better recognition accuracy.
          </p>
          <WebcamCapture onCapture={handleCapture} maxImages={5} />
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-color)' }} onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={images.length < 5 || loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log in</Link>
        </p>
      )}
    </div>
  );
};

export default Register;
