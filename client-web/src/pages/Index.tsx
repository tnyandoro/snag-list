import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This page should only be accessed at root "/"
    // Check auth and redirect appropriately
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // Already logged in, go to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // Not logged in, go to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

export default Index;
