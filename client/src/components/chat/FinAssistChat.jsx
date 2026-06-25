import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/api';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { 
  MessageSquare, X, Send, Sparkles, 
  HelpCircle, ChevronDown, Landmark, ShieldCheck 
} from 'lucide-react';

export const FinAssistChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am **FinAssist AI**, your virtual banking and credit advisor. How can I help you today? You can ask me questions about CIBIL scores, loan eligibility, or how to calculate your EMIs."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Clear input if we are sending from input box
    if (!textToSend) {
      setInputValue('');
    }

    // Add user message to history
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setSending(true);

    try {
      const response = await chatService.sendMessage(text);
      setMessages((prev) => [...prev, { sender: 'ai', text: response.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { 
          sender: 'ai', 
          text: "I am having trouble connecting to the bank service right now. Please try again. You can also review your CIBIL score details on the dashboard." 
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  // Render markdown-like text in chat bubble cleanly
  const renderMessageText = (text) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((para, pIdx) => {
      // Check if paragraph is a heading
      if (para.startsWith('### ')) {
        return <h4 key={pIdx} className="text-xs font-black text-[var(--text-primary)] mt-2 mb-1 border-b border-[var(--border-default)] pb-1">{para.replace('### ', '')}</h4>;
      }
      if (para.startsWith('#### ')) {
        return <h5 key={pIdx} className="text-[11px] font-bold text-[var(--text-secondary)] mt-2 mb-1">{para.replace('#### ', '')}</h5>;
      }

      // Process lists (starting with - or *)
      const lines = para.split('\n');
      const isList = lines.every(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./));

      if (isList) {
        return (
          <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
            {lines.map((line, lIdx) => {
              const cleanedLine = line.trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
              return <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInlineStyles(cleanedLine) }}></li>;
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="text-[11px] leading-relaxed text-[var(--text-secondary)] my-1" 
           dangerouslySetInnerHTML={{ __html: formatInlineStyles(para) }}></p>
      );
    });
  };

  // Helper to format bold **text** and highlights
  const formatInlineStyles = (text) => {
    let html = text;
    // Replace **text** with <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\//g, '<strong class="text-[var(--text-primary)] font-bold">$1</strong>');
    // Also support **text** with ** closing
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--text-primary)] font-bold">$1</strong>');
    // Replace `code` with styled span
    html = html.replace(/`(.*?)`/g, '<span class="px-1 py-0.5 rounded bg-[var(--bg-surface-alt)] font-mono text-[9px] text-[var(--text-accent)] border border-[var(--border-default)]">$1</span>');
    return html;
  };

  const suggestionChips = [
    { label: 'Improve CIBIL', query: 'How do I improve my CIBIL credit score?' },
    { label: 'Explain EMI', query: 'Explain how a monthly EMI is calculated.' },
    { label: 'KYC & Verifications', query: 'What are the rules for PAN, Aadhaar, and bank verification?' },
    { label: 'My Loan Status', query: 'Why was my loan application rejected/approved?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      
      {/* Expanded Chat Window */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[500px] shadow-2xl rounded-2xl flex flex-col mb-4 overflow-hidden border border-[var(--border-default)]">
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-wide">FinAssist AI</h3>
                <span className="text-[9px] text-blue-200 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Credit Advisor
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message History & Chips Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-surface-alt)]">
            
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b" style={{ borderColor: 'var(--border-default)' }}>
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={sending}
                  className="px-2.5 py-1 rounded-full border bg-[var(--bg-surface)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all duration-200 text-left disabled:opacity-50 disabled:pointer-events-none"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Message bubbles */}
            <div className="space-y-3.5">
              {messages.map((msg, idx) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md border ${
                      isAI 
                        ? 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)] rounded-tl-none' 
                        : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'
                    }`}>
                      {isAI ? (
                        <div className="space-y-1">{renderMessageText(msg.text)}</div>
                      ) : (
                        <p className="text-[11px] leading-normal">{msg.text}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-surface)] border text-[var(--text-muted)] rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-1.5" style={{ borderColor: 'var(--border-default)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef}></div>
            </div>
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-[var(--bg-surface)] border-t flex gap-2" style={{ borderColor: 'var(--border-default)' }}>
            <input
              type="text"
              placeholder="Ask FinAssist anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={sending}
              className="flex-1 bg-[var(--bg-input)] border rounded-xl px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              style={{ borderColor: 'var(--border-default)' }}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={sending || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

        </Card>
      )}

      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-350 shadow-2xl border ${
          isOpen 
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-alt)] rotate-90 scale-95' 
            : 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-500 hover:scale-105 hover:shadow-indigo-500/25 text-white'
        }`}
      >
        {isOpen ? (
          <ChevronDown className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>

    </div>
  );
};
