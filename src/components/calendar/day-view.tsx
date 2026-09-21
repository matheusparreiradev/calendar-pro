'use client';

import React from 'react';
import { 
  format, 
  parseISO, 
  isToday, 
  setHours, 
  setMinutes,
  getHours,
  getMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, CATEGORIES } from '@/types/calendar';
import { MapPin, Clock, AlignLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DayView({
  currentDate,
  events,
  onSelectEvent,
  onSelectSlot,
}: DayViewProps) {
  const isDayToday = isToday(currentDate);

  // Filter events for this specific day
  const dayEvents = events.filter((e) => {
    try {
      const eventStart = parseISO(e.start_time);
      return (
        eventStart.getFullYear() === currentDate.getFullYear() &&
        eventStart.getMonth() === currentDate.getMonth() &&
        eventStart.getDate() === currentDate.getDate()
      );
    } catch {
      return false;
    }
  });

  const allDayEvents = dayEvents.filter((e) => e.all_day);
  const timedEvents = dayEvents.filter((e) => !e.all_day);

  // Calculate current time line if today
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimePercentage = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-y-auto">
      {/* Day Banner */}
      <div className="sticky top-0 z-20 bg-background border-b px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shadow-xs ${
              isDayToday ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}
          >
            <span className="text-[10px] uppercase font-semibold">
              {format(currentDate, 'EEE', { locale: ptBR })}
            </span>
            <span className="text-xl leading-none">{format(currentDate, 'd')}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold capitalize">
              {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <p className="text-xs text-muted-foreground">
              {dayEvents.length} {dayEvents.length === 1 ? 'compromisso agendado' : 'compromissos agendados'}
            </p>
          </div>
        </div>

        {allDayEvents.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-medium">Dia todo:</span>
            {allDayEvents.map((evt) => (
              <Badge
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: evt.color }}
              >
                {evt.title}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 24-hour timeline */}
      <div className="relative flex-1 flex">
        {/* Time Labels */}
        <div className="w-20 select-none border-r divide-y shrink-0">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-20 pr-3 text-right text-xs text-muted-foreground font-mono -translate-y-2.5"
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Hour slots */}
        <div className="relative flex-1 divide-y divide-border/50">
          {HOURS.map((hour) => (
            <div
              key={hour}
              onClick={() => {
                const slot = setMinutes(setHours(currentDate, hour), 0);
                onSelectSlot(slot);
              }}
              className="h-20 hover:bg-muted/30 cursor-pointer transition-colors group flex items-start p-2"
            >
              <span className="text-[10px] text-muted-foreground/30 group-hover:text-muted-foreground/80 transition-colors">
                + Adicionar às {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}

          {/* Current time line */}
          {isDayToday && (
            <div
              className="absolute left-0 right-0 border-t-2 border-primary z-10 pointer-events-none flex items-center"
              style={{ top: `${currentTimePercentage}%` }}
            >
              <div className="w-3 h-3 rounded-full bg-primary -ml-1.5 shadow-xs" />
              <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-mono rounded">
                Agora ({format(now, 'HH:mm')})
              </span>
            </div>
          )}

          {/* Placed event cards */}
          {timedEvents.map((evt) => {
            const cat = CATEGORIES[evt.category] || CATEGORIES.trabalho;
            let startH = 0;
            let startM = 0;
            let durationMinutes = 60;

            try {
              const start = parseISO(evt.start_time);
              const end = parseISO(evt.end_time);
              startH = getHours(start);
              startM = getMinutes(start);
              const diff = (end.getTime() - start.getTime()) / (1000 * 60);
              durationMinutes = Math.max(diff, 30);
            } catch {
              startH = 9;
              startM = 0;
            }

            // 1 hour = 80px (h-20 is 5rem = 80px)
            const hourHeight = 80;
            const top = (startH + startM / 60) * hourHeight;
            const height = Math.max((durationMinutes / 60) * hourHeight - 4, 38);

            return (
              <div
                key={evt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(evt);
                }}
                className="absolute left-4 right-6 rounded-lg p-3 shadow-xs border cursor-pointer hover:shadow-md transition-all z-1 overflow-hidden"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  backgroundColor: `${evt.color || cat.color}18`,
                  borderColor: `${evt.color || cat.color}70`,
                  borderLeftWidth: '5px',
                  borderLeftColor: evt.color || cat.color,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-bold text-sm truncate"
                        style={{ color: evt.color || cat.color }}
                      >
                        {evt.title}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background/80 border text-foreground">
                        {cat.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {format(parseISO(evt.start_time), 'HH:mm')} - {format(parseISO(evt.end_time), 'HH:mm')}
                      </span>
                      {evt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {evt.location}
                        </span>
                      )}
                    </div>

                    {height > 65 && evt.description && (
                      <p className="text-xs text-foreground/80 mt-2 line-clamp-2 flex items-start gap-1">
                        <AlignLeft className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70" />
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
