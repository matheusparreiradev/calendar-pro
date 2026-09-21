'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Search, 
  Database,
  CloudCheck,
  HardDrive
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarViewType } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onNewEvent: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSupabaseConnected: boolean;
  tableMissing: boolean;
}

export function Header({
  currentDate,
  onNavigate,
  currentView,
  onViewChange,
  onNewEvent,
  searchQuery,
  onSearchChange,
  isSupabaseConnected,
  tableMissing,
}: HeaderProps) {
  // Format title based on view
  const formattedDate = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <header className="border-b bg-card text-card-foreground px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
      {/* Brand and Navigation Controls */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight">Calendar Pro</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-medium">Supabase Cloud</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('today')}
            className="h-8 px-3 text-xs font-medium font-sans"
          >
            Hoje
          </Button>

          <div className="flex items-center border rounded-md overflow-hidden bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('prev')}
              className="h-8 w-8 rounded-none"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('next')}
              className="h-8 w-8 rounded-none"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-base font-semibold text-foreground ml-2 select-none min-w-[160px]">
            {capitalizedDate}
          </h2>
        </div>
      </div>

      {/* Middle: Search bar */}
      <div className="relative w-full md:w-72 max-w-sm">
        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar eventos ou locais..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-xs bg-muted/40 border-border focus-visible:ring-1"
        />
      </div>

      {/* Right: View Toggle, Status & Action */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Supabase Status Indicator */}
        <div className="hidden lg:flex items-center mr-1">
          {isSupabaseConnected && !tableMissing ? (
            <Badge variant="outline" className="text-[11px] gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
              <Database className="w-3 h-3 text-emerald-500" />
              Sincronizado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px] gap-1 border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-950/40">
              <HardDrive className="w-3 h-3 text-amber-500" />
              Local
            </Badge>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center border rounded-lg p-0.5 bg-muted/60">
          {(['month', 'week', 'day', 'agenda'] as CalendarViewType[]).map((view) => {
            const labels: Record<CalendarViewType, string> = {
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
            };
            const isActive = currentView === view;
            return (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {labels[view]}
              </button>
            );
          })}
        </div>

        {/* New Event Button */}
        <Button
          size="sm"
          onClick={onNewEvent}
          className="h-8 gap-1 text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Criar</span>
        </Button>
      </div>
    </header>
  );
}
