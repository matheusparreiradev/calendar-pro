'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatabaseAlertProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

const SQL_SCRIPT = `-- Execute este SQL no Supabase Dashboard para criar a tabela de eventos:
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'trabalho',
  color TEXT DEFAULT '#3b82f6',
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete events" ON public.events FOR DELETE USING (true);`;

export function DatabaseAlert({ onRetry, isRetrying }: DatabaseAlertProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-lg text-sm mb-4 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950 dark:text-amber-100">
              Supabase conectado • Modo Local Ativo (Tabela `events` pendente)
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              O app está totalmente funcional salvando no seu navegador. Para sincronizar em nuvem no Supabase, crie a tabela no SQL Editor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-8 text-xs border-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:border-amber-700 text-amber-900 dark:text-amber-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copiar SQL
              </>
            )}
          </Button>

          <a
            href="https://supabase.com/dashboard/project/vlqntlfxcofpeavdffrm/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            Abrir SQL Editor
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>

          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            disabled={isRetrying}
            className="h-8 px-2 text-xs text-amber-800 dark:text-amber-300 hover:bg-amber-200/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {expanded && (
        <pre className="mt-3 p-3 bg-zinc-900 text-zinc-100 rounded-md text-xs font-mono overflow-x-auto">
          {SQL_SCRIPT}
        </pre>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[11px] underline text-amber-700 dark:text-amber-400 mt-1 hover:text-amber-900"
      >
        {expanded ? 'Ocultar código SQL' : 'Visualizar código SQL'}
      </button>
    </div>
  );
}
