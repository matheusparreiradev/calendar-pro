'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Calendar as CalendarIcon,
  Tag
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CalendarEvent, CATEGORIES, EventCategory } from '@/types/calendar';

interface SidebarProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onNewEvent: () => void;
  selectedCategories: Set<EventCategory>;
  onToggleCategory: (category: EventCategory) => void;
  events: CalendarEvent[];
}

export function Sidebar({
  currentDate,
  onSelectDate,
  onNewEvent,
  selectedCategories,
  onToggleCategory,
  events,
}: SidebarProps) {
  const [miniDate, setMiniDate] = useState<Date>(currentDate);

  // Sync mini date with current date if month changes
  React.useEffect(() => {
    setMiniDate(currentDate);
  }, [currentDate]);

  // Mini calendar calculation
  const monthStart = startOfMonth(miniDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Event counts by category
  const categoryCounts = Object.keys(CATEGORIES).reduce((acc, cat) => {
    acc[cat as EventCategory] = events.filter(e => e.category === cat).length;
    return acc;
  }, {} as Record<EventCategory, number>);

  return (
    <aside className="w-64 border-r bg-card/60 p-4 flex flex-col gap-6 select-none shrink-0 overflow-y-auto">
      {/* Google Calendar Style Quick Create Button */}
      <Button
        onClick={onNewEvent}
        size="lg"
        className="w-full justify-start gap-3 rounded-full px-5 py-6 shadow-md hover:shadow-lg transition-all text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </div>
        <span>Criar Evento</span>
      </Button>

      {/* Mini Calendar Widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-foreground capitalize">
            {format(miniDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-accent"
              onClick={() => setMiniDate(subMonths(miniDate, 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-accent"
              onClick={() => setMiniDate(addMonths(miniDate, 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center">
          {weekDays.map((d, i) => (
            <span key={i} className="text-[10px] font-medium text-muted-foreground py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, miniDate);
            const isSelected = isSameDay(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(day)}
                className={`h-7 w-7 mx-auto rounded-full text-[11px] font-medium flex items-center justify-center transition-colors ${
                  !isCurrentMonth ? 'text-muted-foreground/40' : 'text-foreground'
                } ${
                  isDayToday
                    ? 'bg-primary text-primary-foreground font-bold'
                    : isSelected
                    ? 'bg-accent text-accent-foreground border border-primary/40'
                    : 'hover:bg-muted'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter section */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Categorias
          </h3>
          <span className="text-[11px] text-muted-foreground">
            {events.length} {events.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>

        <div className="space-y-1.5">
          {(Object.keys(CATEGORIES) as EventCategory[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isChecked = selectedCategories.has(catKey);
            const count = categoryCounts[catKey] || 0;

            return (
              <button
                key={catKey}
                onClick={() => onToggleCategory(catKey)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors hover:bg-muted/70 ${
                  isChecked ? 'text-foreground' : 'text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                    style={{
                      borderColor: cat.color,
                      backgroundColor: isChecked ? cat.color : 'transparent',
                    }}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span className="font-medium">{cat.label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-auto pt-4 border-t text-[11px] text-muted-foreground space-y-1">
        <p className="font-medium text-foreground flex items-center gap-1">
          <CalendarIcon className="w-3 h-3 text-primary" /> Dica rápida:
        </p>
        <p>Clique em qualquer dia ou horário para criar um compromisso instantaneamente.</p>
      </div>
    </aside>
  );
}
