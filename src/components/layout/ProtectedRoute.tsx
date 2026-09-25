import { useState, } from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { TerminalBoot } from '../ui/TerminalBoot';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [booting, setBooting] = useState(true);

  // If they aren't logged in, redirect immediately
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, show the terminal boot screen once
  if (booting) {
    return <TerminalBoot onComplete={() => setBooting(false)} />;
  }

  // Once booted, show the actual dashboard
  return <>{children}</>;
}
