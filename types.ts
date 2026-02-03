export interface Shift {
  id: string;
  startTime: string; // ISO String
  endTime: string | null; // ISO String or null if active
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  hourlyRate: number;
  currency: string;
}

export enum ViewState {
  HOME = 'HOME',
  HISTORY = 'HISTORY',
  PAYSTUB = 'PAYSTUB',
  PROFILE = 'PROFILE'
}

export type TimeRange = 'WEEK' | 'MONTH' | 'ALL';