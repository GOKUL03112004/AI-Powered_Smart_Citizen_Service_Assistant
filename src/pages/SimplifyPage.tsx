import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  FileText,
  Sparkles,
  Upload,
  Copy,
  Check,
  Loader2,
  Info,
  ArrowRight,
  BarChart3,
  UploadCloud,
} from 'lucide-react';
import type { SimplifyResult, UploadResult } from '../types';
import { simplifyPolicy, uploadDocument } from '../services/api';
import ErrorBanner from '../components/ErrorBanner';

const SAMPLE_POLICY = `Sub: Implementation of the Revised Procedure for Processing of Applications under the Pradhan Mantri Awas Yojana (Urban) – Guidelines for Beneficiary-Led Construction (BLC) Component with reference to the Operational Guidelines issued vide this Ministry's letter No. PMAY-U/BLC/2021/01 dated 14th March 2021.

In supersession of all previous orders/circulars/instructions on the subject, it is hereby clarified that the eligibility conditions for availing the Central Assistance under the BLC component shall henceforth be construed strictly in accordance with the provisions contained in the Operational Guidelines, as amended from time to time, and no relaxation thereof shall be permissible without the prior concurrence of this Ministry.`;

export default function SimplifyPage() {
  const [policyText, setPolicyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimplifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSimplify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyText.trim() || policyText.trim().length < 10) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await simplifyPolicy(policyText);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simplify policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.simplified_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploadLoading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const data = await uploadDocument(uploadFile);
      setUploadResult(data);
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const compressionRatio =
    result && result.original_length > 0
      ? Math.round((1 - result.simplified_length / result.original_length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">
            Policy Simplifier
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto">
            Paste any complex government policy or circular and get a clear, citizen-friendly explanation with key action points.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input panel */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-heading font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Original Policy Text
              </h2>

              <form onSubmit={handleSimplify} className="space-y-4">
                {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

                <textarea
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  className="input-field resize-none"
                  rows={10}
                  placeholder="Paste your government policy text here..."
                  required
                  minLength={10}
                  maxLength={10000}
                />

                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{policyText.length.toLocaleString()} / 10,000 characters</span>
                  {policyText.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setPolicyText(SAMPLE_POLICY)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Use sample text
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || policyText.trim().length < 10}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Simplifying with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Simplify Policy
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex gap-2.5">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Uses <strong>Self-Reflection AI</strong>: first draft + reflection pass for maximum clarity and accuracy.
                </p>
              </div>
            </div>

            {/* Upload document to KB */}
            <div className="card p-6">
              <h2 className="font-heading font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary-500" />
                Add to Knowledge Base
              </h2>
              <p className="text-sm text-neutral-500 mb-4">
                Upload a .txt document to expand the AI's knowledge base for better answers.
              </p>

              {uploadError && <ErrorBanner message={uploadError} onDismiss={() => setUploadError(null)} />}
              {uploadResult && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 mb-3 animate-fade-in">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{uploadResult.message}</p>
                    <p className="text-emerald-600 text-xs mt-0.5">{uploadResult.chunks_added} chunks added</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all">
                  <Upload className="w-6 h-6 text-neutral-400 mb-1" />
                  <span className="text-sm text-neutral-500">
                    {uploadFile ? uploadFile.name : 'Click to select .txt file'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                </label>

                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploadLoading}
                  className="btn-secondary w-full justify-center"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output panel */}
          <div>
            {!result && !loading && (
              <div className="card p-10 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <Sparkles className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                <p className="text-neutral-400 font-medium">Simplified output will appear here</p>
                <p className="text-neutral-300 text-sm mt-1">Paste a policy and click "Simplify"</p>
              </div>
            )}

            {loading && (
              <div className="card p-10 text-center animate-pulse-slow h-full flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-14 h-14 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">Generating simplified version...</p>
                <p className="text-neutral-400 text-sm mt-1">Self-reflection pass in progress</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-5 animate-slide-up">
                {/* Stats */}
                <div className="card p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <BarChart3 className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                      <p className="font-heading font-bold text-neutral-900">
                        {result.original_length.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400">Original chars</p>
                    </div>
                    <div>
                      <ArrowRight className="w-5 h-5 text-neutral-400 mx-auto mb-1" />
                      <p className="font-heading font-bold text-neutral-900">
                        {result.simplified_length.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400">Simplified chars</p>
                    </div>
                    <div>
                      <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <p className="font-heading font-bold text-amber-600">
                        {compressionRatio > 0 ? `+${compressionRatio}%` : `${Math.abs(compressionRatio)}%`}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {compressionRatio > 0 ? 'More concise' : 'More detailed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simplified output */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-neutral-900 flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      Simplified Version
                    </h3>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-50"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="prose-gov max-h-[500px] overflow-y-auto pr-1">
                    <ReactMarkdown>{result.simplified_text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
