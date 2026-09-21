-- ===================================================
-- SQL DE CRIAÇÃO DA TABELA DE EVENTOS NO SUPABASE
-- Cole este script no SQL Editor do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/vlqntlfxcofpeavdffrm/sql/new
-- ===================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'trabalho', -- 'trabalho', 'pessoal', 'reuniao', 'urgente', 'estudo'
  color TEXT DEFAULT '#3b82f6',
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para demonstração e uso do app
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
CREATE POLICY "Allow public read events" 
  ON public.events FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow public insert events" ON public.events;
CREATE POLICY "Allow public insert events" 
  ON public.events FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update events" ON public.events;
CREATE POLICY "Allow public update events" 
  ON public.events FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Allow public delete events" ON public.events;
CREATE POLICY "Allow public delete events" 
  ON public.events FOR DELETE 
  USING (true);

-- Eventos de exemplo para iniciar o calendário
INSERT INTO public.events (title, description, start_time, end_time, all_day, category, color, location)
VALUES 
  ('Reunião de Alinhamento Semanal', 'Alinhamento com a equipe sobre os projetos em andamento.', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', false, 'trabalho', '#3b82f6', 'Google Meet'),
  ('Almoço com Cliente', 'Discutir próximos passos do novo contrato.', NOW() + INTERVAL '1 day' + INTERVAL '4 hours', NOW() + INTERVAL '1 day' + INTERVAL '5 hours', false, 'reuniao', '#8b5cf6', 'Restaurante Central'),
  ('Revisão de Metas Mensais', 'Análise das métricas e KPIs do mês.', NOW() + INTERVAL '2 days' + INTERVAL '6 hours', NOW() + INTERVAL '2 days' + INTERVAL '7 hours', false, 'estudo', '#f59e0b', 'Escritório'),
  ('Treino na Academia', 'Treino funcional e musculação.', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '11 hours', false, 'pessoal', '#10b981', 'Academia SmartFit'),
  ('Prazo de Entrega do Projeto', 'Finalização dos testes e entrega para o cliente.', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days', true, 'urgente', '#ef4444', 'Online');
