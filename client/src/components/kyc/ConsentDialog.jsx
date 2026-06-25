import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

const ConsentDialog = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  title = "Consent Required", 
  purpose, 
  dataElements = [], 
  isLoading = false 
}) => {
  const [agreed, setAgreed] = useState(false);

  // Reset agreed state whenever dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          >
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--accent-glow)' }}>
                <h3 className="font-semibold text-lg flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  </div>
                  {title}
                </h3>
                <button 
                  onClick={onClose}
                  className="rounded-full p-1.5 transition-all hover:scale-110"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-5">
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Purpose of collection</h4>
                  <p className="text-sm p-3.5 rounded-xl" style={{ 
                    color: 'var(--text-secondary)', 
                    background: 'var(--accent-glow)',
                    border: '1px solid var(--border-default)'
                  }}>
                    {purpose}
                  </p>
                </div>

                {dataElements.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Data requested</h4>
                    <ul className="space-y-2">
                      {dataElements.map((el, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{el}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl p-4 mt-6" style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)' }}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                      <div className="w-5 h-5 border-2 rounded transition-all peer-checked:bg-indigo-500 peer-checked:border-indigo-500"
                        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-input)' }}
                      />
                      <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-xs leading-relaxed select-none" style={{ color: 'var(--text-secondary)' }}>
                      I explicitly authorize CreditWise to fetch, store, and process my data for the specified purpose in accordance with the RBI guidelines. I understand this consent is valid for 180 days and can be revoked anytime.
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-5 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-default)', background: 'var(--accent-glow)' }}>
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button 
                  variant="premium"
                  onClick={onAccept} 
                  disabled={!agreed || isLoading}
                  className={!agreed ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {isLoading ? 'Processing...' : 'I Agree & Continue'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConsentDialog;
