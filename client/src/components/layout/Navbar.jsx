import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, Shield, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full print:hidden" style={{
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-default)',
    }}>
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] hover:text-[var(--text-accent)] transition-colors">
            CreditScoreAI
          </span>
        </Link>
        
        <div className="ml-auto flex items-center space-x-3">
          {/* Dark/Light Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} 
            className="rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-glow)]"
          >
            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </Button>

          {user ? (
            <>
              <span className="text-sm font-medium hidden md:block text-[var(--text-secondary)]">
                Welcome, <span className="font-semibold text-[var(--text-primary)]">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-full border border-indigo-500/20">
                    Admin
                  </span>
                )}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')} 
                title="My Dashboard" 
                className="rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-glow)]"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                title="Logout" 
                className="rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-glow)]">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="premium" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
