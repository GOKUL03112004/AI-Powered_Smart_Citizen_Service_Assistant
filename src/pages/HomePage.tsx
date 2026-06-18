import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  CheckCircle2,
  FileText,
  ArrowRight,
  Sparkles,
  Database,
  GitBranch,
  Bot,
  Users,
  Shield,
  Zap,
} from 'lucide-react';



const features = [
  {
    page: '/chat',
    icon: MessageSquare,
    color: 'bg-blue-50 text-blue-600',
    accent: 'border-blue-200',
    title: 'Chat Assistant',
    description:
      'Ask any question about government services, schemes, or documents. Powered by RAG with ReAct reasoning for accurate, context-aware answers.',
    tags: ['RAG', 'LangGraph', 'ReAct'],
  },
  {
    page: '/eligibility',
    icon: CheckCircle2,
    color: 'bg-emerald-50 text-emerald-600',
    accent: 'border-emerald-200',
    title: 'Eligibility Checker',
    description:
      'Enter your age, occupation, and income to instantly discover all government schemes and welfare programs you qualify for.',
    tags: ['Chain-of-Thought', 'ChromaDB'],
  },
  {
    page: '/simplify',
    icon: FileText,
    color: 'bg-amber-50 text-amber-600',
    accent: 'border-amber-200',
    title: 'Policy Simplifier',
    description:
      'Paste any complex government policy or circular. Get a simplified, citizen-friendly version with key action points extracted.',
    tags: ['Self-Reflection', 'Gemini 2.5'],
  },
];

const techStack = [
  { icon: Bot, label: 'Gemini 2.5 Flash', desc: 'Google AI' },
  { icon: GitBranch, label: 'LangGraph', desc: 'Workflow Orchestration' },
  { icon: Sparkles, label: 'CrewAI', desc: 'Multi-Agent System' },
  { icon: Database, label: 'ChromaDB', desc: 'Vector Database' },
];

const stats = [
  { value: '5+', label: 'Government Schemes' },
  { value: '3', label: 'AI Agents' },
  { value: '4-Step', label: 'LangGraph Workflow' },
  { value: '24/7', label: 'Availability' },
];

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gov-navy overflow-hidden pt-24 pb-20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-gov-teal/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            Powered by Google Gemini 2.5 Flash
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-slide-up leading-tight">
            AI-Powered Smart
            <br />
            <span className="text-primary-400">Citizen Service</span> Assistant
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-blue-200 mb-10 animate-fade-in leading-relaxed">
            Navigate government services effortlessly. Ask questions, check eligibility, and understand complex policies — all in plain language.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
            <button onClick={() => navigate('/chat')} className="btn-primary text-base px-6 py-3">
              <MessageSquare className="w-5 h-5" />
              Start Chatting
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/eligibility')} className="btn-secondary text-base px-6 py-3 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <CheckCircle2 className="w-5 h-5" />
              Check Eligibility
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-heading text-3xl font-extrabold text-white">{value}</p>
                <p className="text-sm text-blue-300 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 mb-3">
              Everything You Need
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              Three powerful AI tools to help you navigate India's government services landscape with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ page, icon: Icon, color, accent, title, description, tags }) => (
              <div
                key={page}
                className={`card card-hover p-6 border-t-4 ${accent} cursor-pointer group`}
                onClick={() => navigate(page)}
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-neutral-900 mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed mb-4">{description}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {tags.map((tag) => (
                    <span key={tag} className="badge-info text-xs">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-primary-600 text-sm font-semibold group-hover:gap-3 transition-all">
                  Try now <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-neutral-900 mb-4">
                Built on a Comprehensive Knowledge Base
              </h2>
              <p className="text-neutral-500 mb-8 leading-relaxed">
                Our AI is trained on official government documents and scheme guidelines, ensuring accurate and up-to-date information.
              </p>
              <div className="space-y-3">
                {[
                  { icon: '📄', label: 'Birth Certificate Guide' },
                  { icon: '🏪', label: 'Trade License Guide' },
                  { icon: '👴', label: 'Senior Citizen Pension Scheme' },
                  { icon: '🌾', label: 'Farmer Welfare Scheme (PM-KISAN)' },
                  { icon: '📋', label: 'Income Certificate Guide' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium text-neutral-700">{label}</span>
                    <span className="ml-auto badge-success">Active</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {techStack.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="card p-5">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <p className="font-semibold text-neutral-900 text-sm">{label}</p>
                  <p className="text-neutral-400 text-xs mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 mb-3">
              LangGraph Workflow
            </h2>
            <p className="text-neutral-500">4-step intelligent pipeline for every query</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0 max-w-4xl mx-auto">
            {[
              { step: '01', label: 'Query Analyzer', desc: 'Detects intent & extracts entities' },
              { step: '02', label: 'Policy Research', desc: 'Retrieves from ChromaDB' },
              { step: '03', label: 'Response Generation', desc: 'Chain-of-Thought reasoning' },
              { step: '04', label: 'Review Agent', desc: 'Self-reflection improvement' },
            ].map(({ step, label, desc }, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center text-center p-5 bg-white rounded-xl border border-neutral-100 shadow-card min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm mb-3">
                    {step}
                  </div>
                  <p className="font-semibold text-neutral-900 text-sm">{label}</p>
                  <p className="text-neutral-400 text-xs mt-1">{desc}</p>
                </div>
                {idx < 3 && (
                  <div className="text-neutral-300 hidden sm:block mx-1">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gov-navy">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Users className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="font-heading text-3xl font-bold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-blue-200 mb-8">
            Access government services information instantly, in plain language you can understand.
          </p>
          <button onClick={() => navigate('/chat')} className="btn-primary text-base px-8 py-3">
            <MessageSquare className="w-5 h-5" />
            Ask Your First Question
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-primary-400" />
          <span className="text-white font-medium">CitizenAssist AI</span>
        </div>
        <p>AI-Powered Smart Citizen Service Assistant &bull; Built with Gemini 2.5 Flash, LangGraph &amp; CrewAI</p>
        <p className="mt-1 text-xs text-neutral-600">
          This is an AI assistant. Always verify information with official government sources.
        </p>
      </footer>
    </div>
  );
}
