import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, Zap, TrendingUp, HelpCircle, CheckCircle, Smartphone } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] text-slate-800 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-28 flex flex-col items-center justify-center overflow-hidden bg-transparent">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            AI-Driven Credit Intelligence for Indian Banks
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            AI-Powered Credit Scoring <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              & Loan Eligibility System
            </span>
          </h1>
          
          <p className="mx-auto max-w-[750px] text-slate-500 dark:text-slate-400 text-lg md:text-xl font-normal leading-relaxed">
            Assess applicant creditworthiness instantly using localized Indian financial parameters (₹), verify bank accounts in real-time, detect potential frauds, and get explainable AI insights.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white font-semibold h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white font-semibold h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-slate-300 dark:border-slate-750 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 h-12 px-8 rounded-xl">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Indian Parameter Highlights */}
      <section className="w-full py-16 border-t border-[var(--border-default)] bg-transparent">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Indian Credit Parameters</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Tailored specifically to Indian banking norms, tax systems, and demographics.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="p-6 rounded-2xl glass-panel glass-panel-hover">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500 dark:text-blue-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant ML Predictions</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                An advanced XGBoost machine learning model trained on 10,000 Indian consumer profiles evaluates applicant eligibility in milliseconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">PAN & Aadhaar Verification</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Instant format compliance validation for Permanent Account Number (PAN) and Aadhaar Card to prevent identity errors and ensure structural accuracy.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Penny Drop Bank Check</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                A simulated RazorpayX/Setu API verification that performs a penny drop test to confirm account existence, IFSC validity, and name matching.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500 dark:text-red-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Automated Fraud Engine</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Real-time checks that instantly flag mismatched income-to-loan ratios (e.g. low income requesting high capital) to safeguard bank reserves.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Explainable AI (XAI)</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Transparency matters. Instead of a black-box "Approved" or "Rejected" response, receive clear bullet points detailing the exact positive and negative factors.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">FinAssist AI Chatbot</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Interact with our virtual banking assistant trained to explain credit score bands, give personalized tips to improve scores, and calculate EMIs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
