import axios from 'axios';
import type { EligibilityResult, SimplifyResult, UploadResult } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export interface ChatApiResponse {
  response: string;
  intent: string;
  entities: string;
  workflow_steps: string[];
  success: boolean;
}

export async function sendChatMessage(query: string): Promise<ChatApiResponse> {
  const { data } = await api.post<ChatApiResponse>('/chat', { query });
  return data;
}

export async function checkEligibility(
  age: number,
  occupation: string,
  annual_income: number
): Promise<EligibilityResult> {
  const { data } = await api.post<EligibilityResult>('/eligibility', {
    age,
    occupation,
    annual_income,
  });
  return data;
}

export async function simplifyPolicy(policy_text: string): Promise<SimplifyResult> {
  const { data } = await api.post<SimplifyResult>('/simplify-policy', { policy_text });
  return data;
}

export async function uploadDocument(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<UploadResult>('/upload-document', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function healthCheck(): Promise<{ status: string; documents_in_kb: number }> {
  const { data } = await api.get('/health');
  return data;
}
