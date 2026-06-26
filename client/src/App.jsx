import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyDashboard from './pages/MyDashboard';
import ApplicationForm from './pages/ApplicationForm';
import PredictionResult from './pages/PredictionResult';
import AdminDashboard from './pages/AdminDashboard';
import { FinAssistChat } from './components/chat/FinAssistChat';
import { AuthContext } from './context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const { user } = useContext(AuthContext);
  // Theme state: read from localStorage, default to dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sync theme with document element class list
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans print:h-auto print:block print:overflow-visible">
      <Navbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      
      {/* Inner viewport container - fills remaining vertical space exactly */}
      <div className="flex flex-1 overflow-hidden print:block print:overflow-visible relative">
        {user && <Sidebar isOpen={sidebarOpen} />}
        
        {/* Floating Sidebar Toggle Button */}
        {user && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="absolute top-1.5 z-40 p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--accent-glow)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md transition-all duration-300 ease-in-out hidden md:flex items-center justify-center cursor-pointer"
            style={{
              left: sidebarOpen ? '272px' : '16px'
            }}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        
        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 print:block print:overflow-visible print:p-0">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Applicant Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/my-dashboard" element={<MyDashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/apply" element={<ApplicationForm />} />
                <Route path="/prediction/:id" element={<PredictionResult />} />
              </Route>
              
              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </div>
        </main>
      </div>
      
      {user && user.role !== 'admin' && <FinAssistChat />}
      
      <ToastContainer 
        position="bottom-right" 
        theme={darkMode ? "dark" : "light"} 
        toastClassName={`${darkMode ? 'bg-slate-900 border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-900'} rounded-xl shadow-2xl`}
      />
    </div>
  );
}

export default App;
