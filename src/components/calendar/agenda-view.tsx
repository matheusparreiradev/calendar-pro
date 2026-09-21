'use client';

import React from 'react';
import { 
  format, 
  parseISO, 
  isToday, 
  isTomorrow, 
  isYesterday 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, CATEGORIES } from '@/types/calendar';
import { Clock, MapPin, AlignLeft, CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AgendaViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onNewEvent: () => void;
}

export function AgendaView({
  events,
  onSelectEvent,
  onNewEvent,
}: AgendaViewProps) {
  // Sort events by start_time
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  // Group events by YYYY-MM-DD
  const groupedEvents = sortedEvents.reduce((acc, evt) => {
    try {
      const dateKey = evt.start_time.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(evt);
    } catch {
      // ignore
    }
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const dateKeys = Object.keys(groupedEvents);

  if (dateKeys.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <CalendarDays className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Nenhum compromisso encontrado</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
          Não há eventos agendados para este período com os filtros atuais selecionados.
        </p>
        <Button onClick={onNewEvent} className="gap-2">
          <Plus className="w-4 h-4" />
          Agendar Primeiro Evento
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-background/50">
      <div className="max-w-4xl mx-auto space-y-8">
        {dateKeys.map((dateKey) => {
          const dayEvents = groupedEvents[dateKey];
          const dateObj = parseISO(dateKey);
          const isDayToday = isToday(dateObj);
          const isDayTomorrow = isTomorrow(dateObj);
          const isDayYesterday = isYesterday(dateObj);

          let relativeLabel = '';
          if (isDayToday) relativeLabel = 'Hoje';
          else if (isDayTomorrow) relativeLabel = 'Amanhã';
          else if (isDayYesterday) relativeLabel = 'Ontem';

          return (
            <div key={dateKey} className="space-y-3">
              {/* Group Date Header */}
              <div className="flex items-center gap-2 pb-1 border-b">
                <span className="text-sm font-bold text-foreground capitalize">
                  {format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </span>
                {relativeLabel && (
                  <Badge
                    variant={isDayToday ? 'default' : 'secondary'}
                    className="text-[10px] uppercase font-bold"
                  >
                    {relativeLabel}
                  </Badge>
                )}
              </div>

              {/* Event Cards */}
              <div className="grid gap-3">
                {dayEvents.map((evt) => {
                  const cat = CATEGORIES[evt.category] || CATEGORIES.trabalho;

                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="group p-4 rounded-xl border bg-card hover:bg-accent/30 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                      style={{
                        borderLeftWidth: '5px',
                        borderLeftColor: evt.color || cat.color,
                      }}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                            {evt.title}
                          </h4>
                          <span
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${evt.color || cat.color}20`,
                              color: evt.color || cat.color,
                            }}
                          >
                            {cat.label}
                          </span>
                        </div>

                        {evt.description && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1.5 line-clamp-2">
                            <AlignLeft className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70" />
                            {evt.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {evt.all_day
                              ? 'Dia todo'
                              : `${format(parseISO(evt.start_time), 'HH:mm')} às ${format(
                                  parseISO(evt.end_time),
                                  'HH:mm'
                                )}`}
                          </span>

                          {evt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="self-end md:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-medium opacity-80 group-hover:opacity-100"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
