import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, ShieldAlert, Sparkles } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const mainLinks = [
    { icon: LayoutDashboard, label: 'Applicant Dashboard', to: '/dashboard' },
    { icon: FileText, label: 'Apply for Loan', to: '/apply' },
  ];

  const adminLinks = [];
  if (user?.role === 'admin') {
    adminLinks.push({ to: '/admin', icon: ShieldAlert, label: 'Admin Panel' });
  }

  const renderLinks = (links) =>
    links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className={({ isActive }) =>
          cn("nav-item", isActive && "active")
        }
      >
        <link.icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
        {link.label}
      </NavLink>
    ));

  const SectionLabel = ({ children }) => (
    <div className="px-4 pt-5 pb-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {children}
      </span>
    </div>
  );

  return (
    <div className="w-64 sidebar-panel flex-shrink-0 hidden md:flex flex-col h-full justify-between print:hidden">
      <div className="flex flex-col overflow-y-auto pt-4 pb-4 px-3">
        {/* Brand accent banner */}
        <div className="px-2 mb-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-[var(--text-accent)]">Indian Banking AI v1.0</span>
          </div>
        </div>

        <nav className="space-y-1">
          <SectionLabel>Applicant Portal</SectionLabel>
          {renderLinks(mainLinks)}

          {user?.role === 'admin' && (
            <>
              <SectionLabel>Administration</SectionLabel>
              {renderLinks(adminLinks)}
            </>
          )}
        </nav>
      </div>

      {/* User profile section - fixed at the bottom of the sidebar */}
      {user && (
        <div className="p-4 border-t" style={{ 
          borderColor: 'var(--border-default)', 
          background: 'var(--bg-surface-alt)' 
        }}>
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border flex items-center justify-center shadow-inner" style={{
              borderColor: 'var(--border-default)'
            }}>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-[var(--text-primary)]">{user.name}</p>
              <p className="text-xs truncate text-[var(--text-secondary)]">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
