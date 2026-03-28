import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const WELCOME_MESSAGE = {
  id: 1,
  type: 'bot',
  text: "👋 Hi! I'm your Internship Assistant.\n\nTry asking:\n• \"What is my application status?\"\n• \"Show my last application\"\n• \"How many applications do I have?\"\n• \"Am I shortlisted anywhere?\"",
};

function FormattedText({ text }) {
  return (
    <>
      {text.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
              : part
          )}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export default function Chatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, messages]);

  if (!isAuthenticated) return null;

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now(), type: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(trimmed);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: res.data.reply,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: '⚠️ Something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const quickReplies = [
    'My application status',
    'Last application',
    'Am I shortlisted?',
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle chat assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg shadow-brand-500/40 flex items-center justify-center text-white text-2xl hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
          style={{ maxHeight: '520px', background: '#0f0f1a' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-brand-600/90 to-purple-700/90 border-b border-white/10">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🤖</div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Internship Assistant</p>
              <p className="text-brand-200 text-xs mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '260px', maxHeight: '320px' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-brand-500/30 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-br from-brand-600 to-purple-700 text-white rounded-tr-sm'
                      : 'text-gray-200 rounded-tl-sm border border-white/8'
                  }`}
                  style={msg.type === 'bot' ? { background: 'rgba(255,255,255,0.06)' } : {}}
                >
                  <FormattedText text={msg.text} />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-brand-500/30 flex items-center justify-center text-xs mr-2 mt-1">🤖</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center border border-white/8" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto border-t border-white/5" style={{ scrollbarWidth: 'none' }}>
            {quickReplies.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-brand-500/15 text-brand-300 border border-brand-500/25 hover:bg-brand-500/25 transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 text-white text-sm placeholder-gray-500 rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-brand-500 transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 text-sm"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
