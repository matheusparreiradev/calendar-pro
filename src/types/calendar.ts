export type EventCategory = 'trabalho' | 'pessoal' | 'reuniao' | 'urgente' | 'estudo';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  start_time: string; // ISO 8601 string
  end_time: string;   // ISO 8601 string
  all_day: boolean;
  category: EventCategory;
  color: string;
  location?: string | null;
  created_at?: string;
}

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

export interface CategoryInfo {
  id: EventCategory;
  label: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
}

export const CATEGORIES: Record<EventCategory, CategoryInfo> = {
  trabalho: {
    id: 'trabalho',
    label: 'Trabalho',
    color: '#3b82f6',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    borderLight: 'border-blue-500',
    textLight: 'text-blue-600',
  },
  pessoal: {
    id: 'pessoal',
    label: 'Pessoal',
    color: '#10b981',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    borderLight: 'border-emerald-500',
    textLight: 'text-emerald-600',
  },
  reuniao: {
    id: 'reuniao',
    label: 'Reunião',
    color: '#8b5cf6',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    borderLight: 'border-purple-500',
    textLight: 'text-purple-600',
  },
  urgente: {
    id: 'urgente',
    label: 'Urgente',
    color: '#ef4444',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    borderLight: 'border-rose-500',
    textLight: 'text-rose-600',
  },
  estudo: {
    id: 'estudo',
    label: 'Estudos',
    color: '#f59e0b',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    borderLight: 'border-amber-500',
    textLight: 'text-amber-600',
  },
};
