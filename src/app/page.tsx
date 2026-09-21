'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays 
} from 'date-fns';
import { CalendarEvent, CalendarViewType, EventCategory } from '@/types/calendar';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/lib/supabase';
import { Header } from '@/components/calendar/header';
import { Sidebar } from '@/components/calendar/sidebar';
import { MonthView } from '@/components/calendar/month-view';
import { WeekView } from '@/components/calendar/week-view';
import { DayView } from '@/components/calendar/day-view';
import { AgendaView } from '@/components/calendar/agenda-view';
import { EventDialog } from '@/components/calendar/event-dialog';
import { DatabaseAlert } from '@/components/calendar/database-alert';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<EventCategory>>(
    new Set<EventCategory>(['trabalho', 'pessoal', 'reuniao', 'urgente', 'estudo'])
  );
  const [searchQuery, setSearchQuery] = useState('');
  
  // Connection state
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dialogInitialDate, setDialogInitialDate] = useState<Date | undefined>(undefined);

  // Load events
  const loadEvents = useCallback(async () => {
    setIsRetrying(true);
    try {
      const res = await fetchEvents();
      setEvents(res.events);
      setIsSupabaseConnected(res.isFromSupabase);
      setTableMissing(res.tableMissing);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Navigation logic
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    if (direction === 'next') {
      if (currentView === 'month') setCurrentDate((prev) => addMonths(prev, 1));
      else if (currentView === 'week') setCurrentDate((prev) => addWeeks(prev, 1));
      else if (currentView === 'day') setCurrentDate((prev) => addDays(prev, 1));
    } else {
      if (currentView === 'month') setCurrentDate((prev) => subMonths(prev, 1));
      else if (currentView === 'week') setCurrentDate((prev) => subWeeks(prev, 1));
      else if (currentView === 'day') setCurrentDate((prev) => subDays(prev, 1));
    }
  };

  // Category toggle
  const handleToggleCategory = (category: EventCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        if (next.size > 1) {
          next.delete(category);
        }
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Open create modal
  const handleNewEvent = (slotDate?: Date) => {
    setSelectedEvent(null);
    setDialogInitialDate(slotDate || currentDate);
    setDialogOpen(true);
  };

  // Open edit modal
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDialogInitialDate(undefined);
    setDialogOpen(true);
  };

  // Save event (create or update)
  const handleSaveEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'created_at'> & { id?: string }
  ) => {
    if (eventData.id) {
      // Update
      const { id, ...updates } = eventData;
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      await updateEvent(id, updates);
    } else {
      // Create
      const res = await createEvent(eventData);
      if (res.data) {
        setEvents((prev) => [...prev, res.data!]);
      }
    }
  };

  // Delete event
  const handleDeleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await deleteEvent(id);
  };

  // Filtered events based on selected categories and search query
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Category check
      if (!selectedCategories.has(e.category)) {
        return false;
      }
      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title?.toLowerCase().includes(q);
        const matchesDesc = e.description?.toLowerCase().includes(q);
        const matchesLoc = e.location?.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesLoc;
      }
      return true;
    });
  }, [events, selectedCategories, searchQuery]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Top Navigation Bar */}
      <Header
        currentDate={currentDate}
        onNavigate={handleNavigate}
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewEvent={() => handleNewEvent()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSupabaseConnected={isSupabaseConnected}
        tableMissing={tableMissing}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <div className="hidden md:flex flex-col">
          <Sidebar
            currentDate={currentDate}
            onSelectDate={(date) => {
              setCurrentDate(date);
            }}
            onNewEvent={() => handleNewEvent()}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            events={events}
          />
        </div>

        {/* Calendar View Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Database Alert Banner if table is not yet created */}
          {tableMissing && (
            <div className="p-4 pb-0">
              <DatabaseAlert onRetry={loadEvents} isRetrying={isRetrying} />
            </div>
          )}

          {/* Active Calendar View */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentView === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={filteredEvents}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleNewEvent}
              />
            )}
            {currentView === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={filteredEvents}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleNewEvent}
              />
            )}
            {currentView === 'day' && (
              <DayView
                currentDate={currentDate}
                events={filteredEvents}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleNewEvent}
              />
            )}
            {currentView === 'agenda' && (
              <AgendaView
                events={filteredEvents}
                onSelectEvent={handleSelectEvent}
                onNewEvent={() => handleNewEvent()}
              />
            )}
          </div>
        </main>
      </div>

      {/* Event Create / Edit Dialog Modal */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        initialDate={dialogInitialDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
