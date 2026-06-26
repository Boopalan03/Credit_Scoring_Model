import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { CONTACT_INFO } from '../../utils/constants';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Custom inline SVG components for social brand icons to ensure compatibility across all environments
const LinkedInIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GitHubIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export const Footer = () => {
  return (
    <footer className="w-full mt-16 border-t border-[var(--border-default)] pt-12 pb-6 print:hidden">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Company Section */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <img 
                src={logo} 
                alt="CreditScoreAI Logo" 
                className="w-9 h-9 rounded-xl object-contain bg-white dark:invert border border-slate-200 dark:border-slate-800 shadow-md"
              />
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] hover:text-[var(--text-accent)] transition-colors duration-300">
                CreditScoreAI
              </span>
            </Link>
            
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              An advanced, AI-powered system designed for modern Indian banking. Instantly evaluate creditworthiness, assess loan eligibility with explainable ML insights, and perform real-time verification secure and fast.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3 pt-2">
              {[
                { icon: LinkedInIcon, url: 'https://www.linkedin.com/in/boopalan-m-03a663292/', label: 'LinkedIn', color: 'hover:text-blue-500 hover:bg-blue-500/10' },
                { icon: GitHubIcon, url: 'https://github.com/Boopalan03', label: 'GitHub', color: 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-500/10' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-xl border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] transition-all duration-300 ${social.color} hover:border-transparent transform hover:-translate-y-1`}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Home', to: '/' },
                { name: 'About Us', to: '/about' },
                { name: 'Apply Loan', to: '/apply' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.to} 
                    className="group flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors duration-200"
                  >
                    <ChevronRight className="h-3 w-3 mr-1 text-[var(--text-muted)] group-hover:text-[var(--text-accent)] transform group-hover:translate-x-1 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Features
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
              {[
                'Credit Score Prediction',
                'Loan Eligibility',
                'AI Chatbot',
                'Analytics',
                'Explainable AI'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2.5 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Contact
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <Mail className="h-4 w-4 mt-0.5 text-indigo-500 flex-shrink-0" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-[var(--text-accent)] transition-colors break-all">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <Phone className="h-4 w-4 mt-0.5 text-indigo-500 flex-shrink-0" />
                <a href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`} className="hover:text-[var(--text-accent)] transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <MapPin className="h-4 w-4 mt-0.5 text-indigo-500 flex-shrink-0" />
                <span>
                  {CONTACT_INFO.address.split(',').map((part, idx, arr) => (
                    <React.Fragment key={idx}>
                      {part.trim()}
                      {idx < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider line */}
        <div className="w-full h-px my-8 bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent"></div>

        {/* Bottom copyright & tagline */}
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-xs text-[var(--text-muted)] text-center">
            © 2026 AI-Powered Credit Scoring & Loan Eligibility System. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
