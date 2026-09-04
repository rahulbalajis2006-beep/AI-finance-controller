import React, { useState } from 'react';
import { ReconciliationResultsJSON } from '../types/finance';
import { Send, Bot } from 'lucide-react';

export default function AskControllerTab({ results }: { results: ReconciliationResultsJSON | null }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{role: 'user' | 'agent', text: string}[]>([]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQ = query;
    setQuery('');
    setChat(prev => [...prev, { role: 'user', text: userQ }]);
    setLoading(true);

    try {
      const customKey = localStorage.getItem('gemini_api_key');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (customKey) {
        headers['x-gemini-api-key'] = customKey;
      }

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          question: userQ,
          context: results ? {
            match_rate: results.match_rate,
            exceptions_count: results.exceptions.length,
            cash: results.cash_position
          } : "No batch processed yet."
        })
      });

      const data = await res.json();
      setChat(prev => [...prev, { role: 'agent', text: data.response }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'agent', text: "AI reasoning temporarily unavailable due to network error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-slate-900">Ask Controller (Layer B Reasoning)</h2>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chat.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Ask a question about the reconciliation batch, cash flow, or exceptions.</p>
              <p className="text-xs mt-2">Example: "Why is the match rate only 96%?"</p>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-br-none' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-none px-5 py-3">
                <span className="text-sm animate-pulse">Analyzing context...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleAsk} className="flex gap-3">
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask the AI Finance Controller..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
