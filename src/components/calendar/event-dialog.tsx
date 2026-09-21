'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarEvent, CATEGORIES, EventCategory } from '@/types/calendar';
import { Trash2, Clock, MapPin, AlignLeft, Tag, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format, parseISO, addHours } from 'date-fns';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null; // If null, create mode; otherwise edit mode
  initialDate?: Date;
  onSave: (event: Omit<CalendarEvent, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const COLOR_SWATCHES = [
  '#e11d48', // rose
  '#ec4899', // pink
  '#f43f5e', // rose vibrant
  '#db2777', // deep pink
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
];

export function EventDialog({
  open,
  onOpenChange,
  event,
  initialDate,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory>('trabalho');
  const [color, setColor] = useState('#3b82f6');
  const [location, setLocation] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form when opening or changing event
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setCategory(event.category || 'trabalho');
      setColor(event.color || CATEGORIES[event.category]?.color || '#3b82f6');
      setLocation(event.location || '');
      setAllDay(event.all_day || false);

      try {
        const start = parseISO(event.start_time);
        const end = parseISO(event.end_time);
        setStartDate(format(start, 'yyyy-MM-dd'));
        setStartTime(format(start, 'HH:mm'));
        setEndDate(format(end, 'yyyy-MM-dd'));
        setEndTime(format(end, 'HH:mm'));
      } catch {
        const now = new Date();
        setStartDate(format(now, 'yyyy-MM-dd'));
        setStartTime('09:00');
        setEndDate(format(now, 'yyyy-MM-dd'));
        setEndTime('10:00');
      }
    } else {
      const baseDate = initialDate || new Date();
      const defaultStart = format(baseDate, 'yyyy-MM-dd');
      const defaultStartTime = format(baseDate, 'HH:mm');
      const defaultEnd = addHours(baseDate, 1);
      const defaultEndTime = format(defaultEnd, 'HH:mm');

      setTitle('');
      setDescription('');
      setCategory('trabalho');
      setColor('#3b82f6');
      setLocation('');
      setAllDay(false);
      setStartDate(defaultStart);
      setStartTime(defaultStartTime === '00:00' ? '09:00' : defaultStartTime);
      setEndDate(defaultStart);
      setEndTime(defaultStartTime === '00:00' ? '10:00' : defaultEndTime);
    }
    setShowDeleteConfirm(false);
  }, [event, initialDate, open]);

  // When category changes, auto update color if not custom
  const handleCategoryChange = (cat: EventCategory) => {
    setCategory(cat);
    setColor(CATEGORIES[cat]?.color || '#3b82f6');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    setIsSaving(true);
    try {
      let finalStart: string;
      let finalEnd: string;

      if (allDay) {
        finalStart = `${startDate}T00:00:00.000Z`;
        finalEnd = `${endDate || startDate}T23:59:59.999Z`;
      } else {
        finalStart = new Date(`${startDate}T${startTime || '00:00'}:00`).toISOString();
        finalEnd = new Date(`${endDate || startDate}T${endTime || '01:00'}:00`).toISOString();
      }

      await onSave({
        id: event?.id,
        title: title.trim(),
        description: description.trim() || null,
        start_time: finalStart,
        end_time: finalEnd,
        all_day: allDay,
        category,
        color,
        location: location.trim() || null,
      });

      onOpenChange(false);
    } catch (err) {
      console.error('Error saving event:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(event.id);
      onOpenChange(false);
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block shrink-0"
                style={{ backgroundColor: color }}
              />
              {event ? 'Editar Compromisso' : 'Novo Compromisso'}
            </DialogTitle>
          </DialogHeader>

          {/* Title input */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Título do Evento *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Reunião com diretoria, Treino, Consulta..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Category selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-muted-foreground" />
              Categoria
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORIES) as EventCategory[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const isSelected = category === catKey;

                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => handleCategoryChange(catKey)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-transparent shadow-xs text-white'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                    }`}
                    style={{
                      backgroundColor: isSelected ? cat.color : undefined,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: isSelected ? '#ffffff' : cat.color,
                      }}
                    />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time Pickers */}
          <div className="space-y-3 bg-muted/20 p-3 rounded-lg border">
            {/* All Day Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="allDay" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Dia inteiro
              </Label>
              <input
                id="allDay"
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
            </div>

            {/* Start Date / Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Início (Data)</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>
              {!allDay && (
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium">Início (Horário)</span>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* End Date / Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Término (Data)</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>
              {!allDay && (
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium">Término (Horário)</span>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Localização ou Link
            </Label>
            <Input
              id="location"
              placeholder="Ex: Google Meet, Sala 402, Café Central..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
              Descrição / Notas
            </Label>
            <Textarea
              id="description"
              placeholder="Adicione detalhes, pauta da reunião ou lembretes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          {/* Color swatches */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold block">Cor do Evento</span>
            <div className="flex items-center gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  type="button"
                  key={swatch}
                  onClick={() => setColor(swatch)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === swatch ? 'scale-125 ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>

          {/* Delete confirmation section */}
          {showDeleteConfirm && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs space-y-2">
              <p className="font-semibold text-destructive">
                Tem certeza que deseja excluir este evento permanentemente?
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-7 text-xs"
                >
                  {isDeleting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Sim, Excluir
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Dialog Footer Actions */}
          <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2">
            <div>
              {event && !showDeleteConfirm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || !title.trim()}
                className="h-8 text-xs font-semibold gap-1.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {event ? 'Atualizar' : 'Salvar Compromisso'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
