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
    <div
      className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-purple-700/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">LoveBot</h2>
            <p className="text-purple-300 text-xs">Your AI relationship & dating assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="p-2 text-purple-400 hover:text-red-400 transition-colors" title="Clear history">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center mt-16 text-purple-400">
            <Sparkles size={40} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Ask LoveBot anything!</p>
            <p className="text-sm mt-2 opacity-70">Dating tips, conversation starters, relationship advice…</p>
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
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'text-white rounded-br-sm'
                  : 'text-purple-100 rounded-bl-sm border border-purple-500/20'
              }`}
              style={
                msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }
                  : { background: 'rgba(138,63,160,0.15)' }
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
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-purple-300 text-sm border border-purple-500/20"
              style={{ background: 'rgba(138,63,160,0.15)' }}>
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
          className="flex-1 resize-none px-4 py-3 rounded-2xl text-sm text-white placeholder-purple-400 outline-none border border-purple-500/30 focus:border-pink-400/60 transition-colors"
          style={{ background: 'rgba(138,63,160,0.15)', maxHeight: '120px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl text-white transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
