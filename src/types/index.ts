export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  entities?: string;
  workflowSteps?: string[];
}

export interface EligibilityProfile {
  age: number;
  occupation: string;
  annual_income: number;
}

export interface EligibleScheme {
  name: string;
  status: 'eligible' | 'not_eligible' | 'potential';
}

export interface EligibilityResult {
  analysis: string;
  eligible_schemes: EligibleScheme[];
  profile: EligibilityProfile;
  success: boolean;
  error?: string;
}

export interface SimplifyResult {
  original_length: number;
  simplified_length: number;
  simplified_text: string;
  initial_draft: string;
  success: boolean;
  error?: string;
}

export interface UploadResult {
  message: string;
  chunks_added: number;
  filename: string;
  success: boolean;
}

export type AppPage = 'home' | 'chat' | 'eligibility' | 'simplify';
