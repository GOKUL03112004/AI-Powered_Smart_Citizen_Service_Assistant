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
  Download,
  Mic,
  MicOff,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
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
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => {
          const sep = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + sep + transcript;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition start error:", e);
      }
    }
  };

  const handleExportPDF = () => {
    const htmlContent = `
      <div style="padding: 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0; font-size: 24px;">CitizenAssist Consultation</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Official Transcript &bull; ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${messages.map(msg => `
            <div style="background-color: ${msg.role === 'user' ? '#f0fdf4' : '#f9fafb'}; border: 1px solid ${msg.role === 'user' ? '#bbf7d0' : '#e5e7eb'}; padding: 15px; border-radius: 8px;">
              <strong style="color: ${msg.role === 'user' ? '#166534' : '#374151'}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
                ${msg.role === 'user' ? 'Citizen' : 'CitizenAssist AI'}
              </strong>
              <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${msg.content.replace(/\n/g, '<br/>')}</div>
              ${msg.workflowSteps && msg.workflowSteps.length > 0 ? `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #d1d5db; font-size: 13px; color: #4b5563;">
                  <strong style="font-size: 12px; color: #6b7280; text-transform: uppercase;">AI Verification Steps:</strong>
                  <ul style="margin-top: 8px; padding-left: 20px; margin-bottom: 0;">
                    ${msg.workflowSteps.map(step => `<li style="margin-bottom: 4px;">${step}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px;">
          This document is generated by the AI-Powered Smart Citizen Service Assistant.
        </div>
      </div>
    `;

    const opt = {
      margin:       15,
      filename:     'Citizen-Service-Transcript.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(htmlContent).save();
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-50"
            title="Download Transcript"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-neutral-50">
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
            placeholder={isListening ? "Listening..." : "Ask about any government service, scheme, or document..."}
            rows={1}
            className="input-field resize-none min-h-[44px] max-h-32 leading-relaxed"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
            disabled={loading || isListening}
          />
          <button
            onClick={toggleListening}
            className={`px-3 py-3 flex-shrink-0 rounded-xl transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            aria-label="Toggle voice input"
            title="Speech to Text"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
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
