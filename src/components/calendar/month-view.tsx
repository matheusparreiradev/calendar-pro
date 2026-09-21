'use client';

import React from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  format,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, CATEGORIES } from '@/types/calendar';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (date: Date) => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function MonthView({
  currentDate,
  events,
  onSelectEvent,
  onSelectSlot,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Map events to days
  const getEventsForDay = (day: Date) => {
    return events.filter((e) => {
      try {
        const eventStart = parseISO(e.start_time);
        return isSameDay(eventStart, day);
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((dayName, idx) => (
          <div
            key={idx}
            className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6 border-b border-r">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const dayEvents = getEventsForDay(day);
          const maxVisible = 3;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const overflowCount = dayEvents.length - maxVisible;

          return (
            <div
              key={idx}
              onClick={() => onSelectSlot(day)}
              className={`min-h-[90px] border-t border-l p-1.5 transition-colors cursor-pointer flex flex-col justify-between group hover:bg-accent/40 ${
                !isCurrentMonth ? 'bg-muted/15 text-muted-foreground/50' : 'bg-card/40'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-transform ${
                    isDayToday
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs scale-105'
                      : isCurrentMonth
                      ? 'text-foreground'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium hidden md:inline">
                    {dayEvents.length} {dayEvents.length === 1 ? 'evt' : 'evts'}
                  </span>
                )}
              </div>

              {/* Event Pills */}
              <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                {visibleEvents.map((evt) => {
                  const cat = CATEGORIES[evt.category] || CATEGORIES.trabalho;
                  let timeStr = '';
                  if (!evt.all_day) {
                    try {
                      timeStr = format(parseISO(evt.start_time), 'HH:mm');
                    } catch {
                      timeStr = '';
                    }
                  }

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="group/pill px-1.5 py-0.5 rounded text-[11px] font-medium truncate flex items-center gap-1 cursor-pointer transition-all hover:brightness-95 border"
                      style={{
                        backgroundColor: `${evt.color || cat.color}18`,
                        borderColor: `${evt.color || cat.color}50`,
                        color: evt.color || cat.color,
                      }}
                      title={`${evt.title} (${timeStr || 'Dia inteiro'})`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: evt.color || cat.color }}
                      />
                      {timeStr && (
                        <span className="font-semibold text-[10px] shrink-0 opacity-80">
                          {timeStr}
                        </span>
                      )}
                      <span className="truncate">{evt.title}</span>
                    </div>
                  );
                })}

                {overflowCount > 0 && (
                  <div className="text-[10px] font-semibold text-muted-foreground pl-1 hover:text-foreground">
                    +{overflowCount} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
