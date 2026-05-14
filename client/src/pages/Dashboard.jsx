import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Shield, Activity, Fingerprint } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [user, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div style={{ color: 'var(--text-color)', textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome to your secure portal.</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto', background: 'var(--panel-bg)',color: 'var(--primary)', border: '1px solid var(--border)' }} onClick={handleLogout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="profile-card">
        <div className="avatar-placeholder">
          {profile?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{profile?.name}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{profile?.email}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left', marginTop: '2rem' }}>
          <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%' }}>
               <Shield color="var(--success)" size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Authentication</p>
              <p style={{ fontWeight: '600' }}>MFA Enabled</p>
            </div>
          </div>
          
          <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%' }}>
               <Fingerprint color="var(--primary)" size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Face ID</p>
              <p style={{ fontWeight: '600' }}>{profile?.hasFaceRegistered ? 'Registered' : 'Pending'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
