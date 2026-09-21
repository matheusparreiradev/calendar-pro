import { createClient } from '@supabase/supabase-js';
import { CalendarEvent } from '@/types/calendar';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlqntlfxcofpeavdffrm.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_CALENDARDBSUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscW50bGZ4Y29mcGVhdmRmZnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODk3NTEsImV4cCI6MjEwNTU2NTc1MX0.YitIicyJHvipkx0w4YUteN66t1k2IYfjq3e8ScY2Nmo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fallback demo events in case the table hasn't been created yet in Supabase
export const INITIAL_DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 'demo-1',
    title: 'Reunião de Alinhamento Semanal',
    description: 'Alinhamento com a equipe sobre os projetos em andamento.',
    start_time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    all_day: false,
    category: 'trabalho',
    color: '#3b82f6',
    location: 'Google Meet',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Almoço de Negócios',
    description: 'Discutir próximos passos do novo contrato com parceiro.',
    start_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T12:30:00.000Z',
    end_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T14:00:00.000Z',
    all_day: false,
    category: 'reuniao',
    color: '#8b5cf6',
    location: 'Restaurante Central',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Estudo: Next.js & Supabase',
    description: 'Leitura da documentação de Server Actions e Realtime.',
    start_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0] + 'T15:00:00.000Z',
    end_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0] + 'T17:00:00.000Z',
    all_day: false,
    category: 'estudo',
    color: '#f59e0b',
    location: 'Home Office',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Treino e Corrida',
    description: 'Corrida matinal de 5km no parque.',
    start_time: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0] + 'T07:00:00.000Z',
    end_time: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0] + 'T08:00:00.000Z',
    all_day: false,
    category: 'pessoal',
    color: '#10b981',
    location: 'Parque da Cidade',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: 'Entrega do Projeto',
    description: 'Data limite para entrega final e deploy em produção.',
    start_time: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString().split('T')[0] + 'T09:00:00.000Z',
    end_time: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString().split('T')[0] + 'T18:00:00.000Z',
    all_day: true,
    category: 'urgente',
    color: '#ef4444',
    location: 'Remoto',
    created_at: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'calendar_pro_events_cache';

export async function fetchEvents(): Promise<{ events: CalendarEvent[]; isFromSupabase: boolean; tableMissing: boolean }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      // Table doesn't exist (PGRST205 or similar)
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        const cached = getLocalEvents();
        return { events: cached, isFromSupabase: false, tableMissing: true };
      }
      throw error;
    }

    if (data) {
      return { events: data as CalendarEvent[], isFromSupabase: true, tableMissing: false };
    }

    return { events: [], isFromSupabase: true, tableMissing: false };
  } catch (err) {
    console.warn('Erro ao carregar do Supabase, utilizando modo local/cache:', err);
    return { events: getLocalEvents(), isFromSupabase: false, tableMissing: true };
  }
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createEvent(event: Omit<CalendarEvent, 'id' | 'created_at'> & { id?: string }): Promise<{ data: CalendarEvent | null; error: Error | null; isLocal: boolean }> {
  const eventId = event.id || generateUUID();
  const payload = {
    ...event,
    id: eventId,
  };

  try {
    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        const localEvent: CalendarEvent = {
          ...payload,
          id: 'local-' + Date.now(),
          created_at: new Date().toISOString(),
        };
        saveLocalEvent(localEvent);
        return { data: localEvent, error: null, isLocal: true };
      }
      console.error('Supabase createEvent error:', error);
      return { data: null, error: new Error(error.message), isLocal: false };
    }

    return { data: data as CalendarEvent, error: null, isLocal: false };
  } catch {
    const localEvent: CalendarEvent = {
      ...payload,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    saveLocalEvent(localEvent);
    return { data: localEvent, error: null, isLocal: true };
  }
}

export async function updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (id.startsWith('local-') || id.startsWith('demo-')) {
      updateLocalEvent(id, updates);
      return { success: true, error: null };
    }

    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST205') {
        updateLocalEvent(id, updates);
        return { success: true, error: null };
      }
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch {
    updateLocalEvent(id, updates);
    return { success: true, error: null };
  }
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (id.startsWith('local-') || id.startsWith('demo-')) {
      deleteLocalEvent(id);
      return { success: true, error: null };
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST205') {
        deleteLocalEvent(id);
        return { success: true, error: null };
      }
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch {
    deleteLocalEvent(id);
    return { success: true, error: null };
  }
}

function getLocalEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_EVENTS;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_EVENTS));
      return INITIAL_DEMO_EVENTS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_DEMO_EVENTS;
  }
}

function saveLocalEvent(event: CalendarEvent) {
  if (typeof window === 'undefined') return;
  const current = getLocalEvents();
  const updated = [...current, event];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}

function updateLocalEvent(id: string, updates: Partial<CalendarEvent>) {
  if (typeof window === 'undefined') return;
  const current = getLocalEvents();
  const updated = current.map(e => e.id === id ? { ...e, ...updates } : e);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}

function deleteLocalEvent(id: string) {
  if (typeof window === 'undefined') return;
  const current = getLocalEvents();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}
