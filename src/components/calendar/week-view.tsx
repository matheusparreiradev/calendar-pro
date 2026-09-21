'use client';

import React from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  format, 
  parseISO,
  getHours,
  getMinutes,
  setHours,
  setMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, CATEGORIES } from '@/types/calendar';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function WeekView({
  currentDate,
  events,
  onSelectEvent,
  onSelectSlot,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Separate all-day events vs timed events
  const allDayEvents = events.filter((e) => e.all_day);
  const timedEvents = events.filter((e) => !e.all_day);

  // Filter events for a given day
  const getEventsForDay = (day: Date) => {
    return timedEvents.filter((e) => {
      try {
        const eventStart = parseISO(e.start_time);
        return isSameDay(eventStart, day);
      } catch {
        return false;
      }
    });
  };

  const getAllDayEventsForDay = (day: Date) => {
    return allDayEvents.filter((e) => {
      try {
        const eventStart = parseISO(e.start_time);
        return isSameDay(eventStart, day);
      } catch {
        return false;
      }
    });
  };

  // Current time position for indicator line
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimePercentage = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-y-auto">
      {/* Week Header */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-xs">
        <div className="grid grid-cols-8 border-b">
          {/* Time gutter spacer */}
          <div className="w-16 p-2 text-right text-[11px] text-muted-foreground border-r font-mono">
            GMT-3
          </div>

          {/* 7 Days headers */}
          {days.map((day, idx) => {
            const isDayToday = isToday(day);
            return (
              <div
                key={idx}
                className={`py-2 text-center border-r last:border-r-0 transition-colors ${
                  isDayToday ? 'bg-primary/5' : ''
                }`}
              >
                <div className="text-[11px] font-medium text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div
                  className={`inline-flex items-center justify-center w-7 h-7 mt-0.5 rounded-full text-sm font-semibold ${
                    isDayToday
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* All day row (if any all day events exist) */}
        {allDayEvents.length > 0 && (
          <div className="grid grid-cols-8 border-b bg-muted/20 min-h-[32px]">
            <div className="w-16 p-1 text-right text-[10px] text-muted-foreground border-r font-medium flex items-center justify-end">
              Dia todo
            </div>
            {days.map((day, idx) => {
              const dayAllDay = getAllDayEventsForDay(day);
              return (
                <div key={idx} className="p-1 border-r last:border-r-0 space-y-1">
                  {dayAllDay.map((evt) => {
                    const cat = CATEGORIES[evt.category] || CATEGORIES.trabalho;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:brightness-95 border"
                        style={{
                          backgroundColor: evt.color || cat.color,
                          color: '#ffffff',
                          borderColor: 'transparent',
                        }}
                      >
                        {evt.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 24h Grid Body */}
      <div className="relative flex-1 grid grid-cols-8">
        {/* Time Labels Column */}
        <div className="w-16 select-none border-r divide-y">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-14 pr-2 text-right text-[11px] text-muted-foreground font-mono -translate-y-2.5"
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day);
          const isDayToday = isToday(day);

          return (
            <div
              key={dayIdx}
              className={`relative border-r last:border-r-0 divide-y divide-border/40 ${
                isDayToday ? 'bg-primary/5' : ''
              }`}
            >
              {/* Hour Slot Click Areas */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  onClick={() => {
                    const slot = setMinutes(setHours(day, hour), 0);
                    onSelectSlot(slot);
                  }}
                  className="h-14 hover:bg-muted/40 cursor-pointer transition-colors"
                />
              ))}

              {/* Current Time Indicator Line */}
              {isDayToday && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-primary z-10 pointer-events-none flex items-center"
                  style={{ top: `${currentTimePercentage}%` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-primary -ml-1.5 shadow-xs" />
                </div>
              )}

              {/* Event Cards Positioned Absolutely */}
              {dayEvents.map((evt) => {
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

                // 1 hour = 56px (h-14 is 3.5rem = 56px)
                const hourHeight = 56;
                const top = (startH + startM / 60) * hourHeight;
                const height = Math.max((durationMinutes / 60) * hourHeight - 2, 24);

                return (
                  <div
                    key={evt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(evt);
                    }}
                    className="absolute left-1 right-1 rounded-md p-1.5 shadow-xs border cursor-pointer hover:shadow-md transition-all z-1 overflow-hidden"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: `${evt.color || cat.color}1c`,
                      borderColor: `${evt.color || cat.color}80`,
                      borderLeftWidth: '4px',
                      borderLeftColor: evt.color || cat.color,
                    }}
                    title={`${evt.title} (${format(parseISO(evt.start_time), 'HH:mm')} - ${format(parseISO(evt.end_time), 'HH:mm')})`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className="font-semibold text-xs leading-snug truncate"
                        style={{ color: evt.color || cat.color }}
                      >
                        {evt.title}
                      </h4>
                      <span className="text-[10px] font-mono opacity-80 shrink-0 font-medium">
                        {format(parseISO(evt.start_time), 'HH:mm')}
                      </span>
                    </div>

                    {height > 40 && evt.location && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        📍 {evt.location}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
