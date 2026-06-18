import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  IndianRupee,
  Loader2,
  FileSearch,
  Info,
} from 'lucide-react';
import type { EligibilityResult } from '../types';
import { checkEligibility } from '../services/api';
import ErrorBanner from '../components/ErrorBanner';

const OCCUPATIONS = [
  'Farmer / Agricultural Worker',
  'Daily Wage Laborer',
  'Small Business Owner',
  'Government Employee',
  'Private Sector Employee',
  'Self-Employed Professional',
  'Retired / Pensioner',
  'Homemaker',
  'Student',
  'Unemployed',
  'Artisan / Craftsperson',
  'Fisherman',
  'Other',
];

function SchemeStatusIcon({ status }: { status: string }) {
  if (status === 'eligible') return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
  if (status === 'not_eligible') return <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />;
  return <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
}

function SchemeStatusBadge({ status }: { status: string }) {
  if (status === 'eligible') return <span className="badge-success">Eligible</span>;
  if (status === 'not_eligible') return <span className="badge-error">Not Eligible</span>;
  return <span className="badge-warning">Potentially Eligible</span>;
}

export default function EligibilityPage() {
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !occupation || !income) return;

    const ageNum = parseInt(age, 10);
    const incomeNum = parseFloat(income.replace(/,/g, ''));

    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError('Please enter a valid age between 0 and 120.');
      return;
    }
    if (isNaN(incomeNum) || incomeNum < 0) {
      setError('Please enter a valid annual income.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await checkEligibility(ageNum, occupation, incomeNum);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eligibleCount = result?.eligible_schemes.filter((s) => s.status === 'eligible').length ?? 0;
  const potentialCount = result?.eligible_schemes.filter((s) => s.status === 'potential').length ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">
            Scheme Eligibility Checker
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto">
            Enter your details to discover all government welfare schemes and programs you may be eligible for.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="font-heading font-bold text-neutral-900 mb-5 text-lg">Your Profile</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

                <div>
                  <label className="label">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-neutral-400" />
                      Age (years)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-field"
                    placeholder="e.g. 65"
                    min="0"
                    max="120"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-neutral-400" />
                      Occupation
                    </span>
                  </label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select occupation...</option>
                    {OCCUPATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-neutral-400" />
                      Annual Income (INR)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="input-field"
                    placeholder="e.g. 120000"
                    min="0"
                    required
                  />
                  {income && !isNaN(parseFloat(income)) && (
                    <p className="text-xs text-neutral-400 mt-1">
                      ₹{parseFloat(income).toLocaleString('en-IN')} per year
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !age || !occupation || !income}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing eligibility...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4" />
                      Check Eligibility
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 p-3 rounded-lg bg-blue-50 border border-blue-100 flex gap-2.5">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Analysis uses Chain-of-Thought AI reasoning against our government scheme knowledge base.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="card p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                <p className="text-neutral-400 font-medium">
                  Fill in your details and click "Check Eligibility" to see which schemes you qualify for.
                </p>
              </div>
            )}

            {loading && (
              <div className="card p-10 text-center animate-pulse-slow">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">Analyzing your eligibility...</p>
                <p className="text-neutral-400 text-sm mt-1">Using Chain-of-Thought reasoning</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6 animate-slide-up">
                {/* Summary */}
                <div className="card p-5">
                  <h3 className="font-heading font-bold text-neutral-900 mb-4">Eligibility Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <p className="font-heading text-2xl font-bold text-emerald-600">{eligibleCount}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Eligible</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <p className="font-heading text-2xl font-bold text-amber-600">{potentialCount}</p>
                      <p className="text-xs text-amber-600 mt-0.5">Potential</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                      <p className="font-heading text-2xl font-bold text-neutral-600">
                        {result.eligible_schemes.length - eligibleCount - potentialCount}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">Not Eligible</p>
                    </div>
                  </div>
                </div>

                {/* Scheme list */}
                {result.eligible_schemes.length > 0 && (
                  <div className="card p-5">
                    <h3 className="font-heading font-bold text-neutral-900 mb-3">Scheme Results</h3>
                    <div className="space-y-2">
                      {result.eligible_schemes.map((scheme, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                          <SchemeStatusIcon status={scheme.status} />
                          <span className="text-sm font-medium text-neutral-700 flex-1">{scheme.name}</span>
                          <SchemeStatusBadge status={scheme.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed analysis */}
                <div className="card p-5">
                  <h3 className="font-heading font-bold text-neutral-900 mb-3">Detailed Analysis</h3>
                  <div className="prose-gov">
                    <ReactMarkdown>{result.analysis}</ReactMarkdown>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    This is an AI-generated assessment for guidance only. Please verify eligibility with the respective government office before applying.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
