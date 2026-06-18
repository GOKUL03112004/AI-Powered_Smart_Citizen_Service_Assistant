import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import type { ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';
import LoadingDots from '../components/LoadingDots';
import ErrorBanner from '../components/ErrorBanner';

const SUGGESTED_QUERIES = [
  'How do I apply for a birth certificate?',
  'What documents are needed for a trade license?',
  'Am I eligible for the senior citizen pension scheme?',
  'What is PM-KISAN and who is eligible?',
  'How do I get an income certificate?',
];

function WorkflowSteps({ steps }: { steps: string[] }) {
  const [open, setOpen] = useState(false);
  if (!steps.length) return null;
  return (
    <div className="mt-3 border-t border-neutral-100 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI Workflow Steps ({steps.length})
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="mt-2 space-y-1 animate-fade-in">
          {steps.map((step, i) => (
            <div key={i} className="text-xs text-neutral-400 flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500 font-medium mt-0.5">{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I\'m your AI-powered government services assistant. I can help you with information about government schemes, welfare programs, document applications, and more. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (query?: string) => {
    const text = (query ?? input).trim();
    if (!text || loading) return;
    setInput('');
    setError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date(),
        intent: res.intent,
        entities: res.entities,
        workflowSteps: res.workflow_steps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI-powered government services assistant. What would you like to know?',
      timestamp: new Date(),
    }]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-sm">CitizenAssist AI</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Online &bull; LangGraph + ReAct
            </div>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-neutral-50">
        {error && (
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'user'
                ? 'bg-neutral-700'
                : 'bg-primary-600'
            }`}>
              {msg.role === 'user'
                ? <User className="w-4 h-4 text-white" />
                : <Bot className="w-4 h-4 text-white" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-white border border-neutral-100 text-neutral-800 rounded-tl-sm shadow-card'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose-gov">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}

                {msg.role === 'assistant' && msg.intent && msg.intent !== '' && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="badge-info text-xs flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {msg.intent.replace(/_/g, ' ')}
                    </span>
                    {msg.entities && (
                      <span className="text-xs text-neutral-400">{msg.entities}</span>
                    )}
                  </div>
                )}

                {msg.workflowSteps && (
                  <WorkflowSteps steps={msg.workflowSteps} />
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-neutral-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
              <LoadingDots />
              <p className="text-xs text-neutral-400 mt-1">Processing through LangGraph workflow...</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested queries (show when only welcome message exists) */}
      {messages.length === 1 && (
        <div className="px-4 py-3 bg-white border-t border-neutral-100">
          <p className="text-xs text-neutral-400 mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 bg-white border-t border-neutral-100">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any government service, scheme, or document..."
            rows={1}
            className="input-field resize-none min-h-[44px] max-h-32 leading-relaxed"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 py-3 flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Press Enter to send &bull; Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
