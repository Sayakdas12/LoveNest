import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sparkles, Send, Trash2, Bot } from 'lucide-react';
import { BaseUrl } from '../utils/constance';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    axios.get(`${BaseUrl}/chatbot/history`, { withCredentials: true })
      .then(res => setMessages(res.data.messages || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await axios.post(`${BaseUrl}/chatbot/message`, { message: text }, { withCredentials: true });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't respond right now. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Clear chat history with LoveBot?')) return;
    await axios.delete(`${BaseUrl}/chatbot/history`, { withCredentials: true });
    setMessages([]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4"
        style={{ borderBottom: '1px solid rgba(196,120,154,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 4px 16px rgba(138,63,160,0.4)' }}>
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ background: 'linear-gradient(135deg,#f0d6e8,#c4789a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LoveBot</h2>
            <p className="text-xs" style={{ color: 'rgba(220,180,200,0.5)' }}>Your AI relationship &amp; dating assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory}
            className="p-2 rounded-xl transition-all hover:brightness-125"
            style={{ color: 'rgba(196,120,154,0.55)', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Clear history">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center mt-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(138,63,160,0.12)', border: '1px solid rgba(196,120,154,0.2)' }}>
              <Sparkles size={28} style={{ color: 'rgba(196,120,154,0.6)' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Ask LoveBot anything!</p>
            <p className="text-sm mt-2" style={{ color: 'rgba(220,180,200,0.4)' }}>Dating tips, conversation starters, relationship advice…</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2 self-end"
                style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
              style={msg.role === 'user'
                ? { background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', color: '#fff' }
                : { background: 'rgba(28,10,42,0.85)', border: '1px solid rgba(196,120,154,0.18)', color: 'rgba(220,180,200,0.85)' }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2"
              style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
              <Bot size={16} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm"
              style={{ background: 'rgba(28,10,42,0.85)', border: '1px solid rgba(196,120,154,0.18)', color: 'rgba(220,180,200,0.65)' }}>
              <span className="loading loading-dots loading-sm" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask LoveBot…"
          rows={1}
          className="flex-1 resize-none text-sm text-white outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(196,120,154,0.2)',
            borderRadius: '16px',
            padding: '12px 16px',
            color: '#fff',
            caretColor: '#c4789a',
            maxHeight: '120px',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
          onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl text-white transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 4px 16px rgba(138,63,160,0.35)' }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
