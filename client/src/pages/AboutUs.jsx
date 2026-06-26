import React, { useState } from 'react';
import { 
  Shield, 
  Target, 
  Cpu, 
  Fingerprint, 
  Sparkles, 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Database,
  Code,
  Layers,
  LineChart
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from 'react-toastify';
import { CONTACT_INFO } from '../utils/constants';

const AboutUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thank you for reaching out! Your inquiry has been submitted successfully.");
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1200);
  };

  return (
    <div className="space-y-16 py-6 text-slate-800 dark:text-slate-100">
      
      {/* Hero Header Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>


        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
          About <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">CreditScoreAI</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          We bridge the gap between traditional banking and cutting-edge intelligence. Our platform enables instantaneous credit evaluations, precise fraud mitigation, and deep explainability for the modern Indian ecosystem.
        </p>
      </section>

      {/* Mission & Vision Row */}
      <section className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="p-8 rounded-2xl glass-panel relative overflow-hidden group border border-[var(--border-default)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            To democratize access to institutional credit by transforming raw financial and alternative data into actionable credit intelligence. We aim to empower financial organizations to make high-confidence, fair, and instantaneous lending decisions, reducing risk while expanding opportunities for millions of creditworthy individuals in India.
          </p>
        </div>

        <div className="p-8 rounded-2xl glass-panel relative overflow-hidden group border border-[var(--border-default)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-300"></div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            To build India's most secure, transparent, and comprehensive AI-powered credit evaluation ecosystem. We envision a future where banking approvals are fully automated, explainable, and resilient against identity frauds—leveraging modern digital public infrastructure (India Stack) to drive financial inclusion.
          </p>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Core System Pillars</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">The advanced technology engines driving our high-accuracy predictions.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Cpu,
              title: "XGBoost ML Engine",
              desc: "Trained on over 10,000 diverse customer profiles, optimizing risk modeling and delivering lightning-fast credit evaluation in milliseconds.",
              color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
            },
            {
              icon: Fingerprint,
              title: "Secure Verification",
              desc: "Seamless, automated validation of PAN & Aadhaar structures, paired with a simulated RazorpayX penny drop test to verify real-time bank accounts.",
              color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            },
            {
              icon: LineChart,
              title: "Explainable AI (XAI)",
              desc: "Full transparency over decisions. Our platform uses SHAP-inspired feature attribution to explain the exact positive and negative factors.",
              color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
            },
            {
              icon: Sparkles,
              title: "FinAssist AI Chatbot",
              desc: "An intelligent virtual assistant designed to guide applicants, explain complex credit score bands, provide improvement tips, and calculate EMIs.",
              color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
            }
          ].map((pillar, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-panel glass-panel-hover border border-[var(--border-default)] space-y-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pillar.color} border`}>
                <pillar.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{pillar.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* Contact & Support Section */}
      <section id="contact" className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Get in Touch</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Have questions about our credit evaluation models, partnership integrations, or API access? Reach out to our support team and technical experts.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-[var(--border-default)]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 flex-shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Email Support</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We respond within 24 business hours.</p>
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-xs font-semibold text-indigo-500 hover:underline mt-1.5 block">
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-[var(--border-default)]">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 flex-shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Call Center</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mon - Sat, 9:00 AM to 6:00 PM IST.</p>
                <a href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`} className="text-xs font-semibold text-purple-500 hover:underline mt-1.5 block">
                  {CONTACT_INFO.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-[var(--border-default)]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Corporate Headquarters</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{CONTACT_INFO.fullAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 p-8 rounded-3xl glass-panel border border-[var(--border-default)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Send a Message
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Rahul Sharma"
                  className="w-full theme-input px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--border-strong)]"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="rahul@example.com"
                  className="w-full theme-input px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--border-strong)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Loan application query, business proposal, etc."
                className="w-full theme-input px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--border-strong)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Message *</label>
              <textarea
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type your detailed message here..."
                className="w-full theme-input px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--border-strong)] resize-none"
              ></textarea>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 rounded-xl shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </Button>
          </form>
        </div>

      </section>

    </div>
  );
};

export default AboutUs;
