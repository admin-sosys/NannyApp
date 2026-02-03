import React, { useState } from 'react';
import { Shift } from '../types';
import { Card } from '../components/Card';
import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, X, Check, Plus } from 'lucide-react';
import { WiiButton } from '../components/WiiButton';

interface HistoryViewProps {
  shifts: Shift[];
  onUpdateShift: (shift: Shift) => Promise<void>;
  onDeleteShift: (id: string) => Promise<void>;
  onAddShift: () => Promise<Shift>; 
}

export const HistoryView: React.FC<HistoryViewProps> = ({ shifts, onUpdateShift, onDeleteShift, onAddShift }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const sortedShifts = [...shifts].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const handleEditClick = (shift: Shift) => {
    setEditingId(shift.id);
    setEditForm({
      start: format(parseISO(shift.startTime), "yyyy-MM-dd'T'HH:mm"),
      end: shift.endTime ? format(parseISO(shift.endTime), "yyyy-MM-dd'T'HH:mm") : ''
    });
  };

  const handleSave = async (id: string) => {
    const original = shifts.find(s => s.id === id);
    if (!original) return;

    const updated: Shift = {
      ...original,
      startTime: new Date(editForm.start).toISOString(),
      endTime: editForm.end ? new Date(editForm.end).toISOString() : null
    };

    await onUpdateShift(updated);
    setEditingId(null);
  };

  const handleManualAdd = async () => {
    try {
      const newShift = await onAddShift();
      // Immediately enter edit mode for the new shift
      handleEditClick(newShift);
    } catch (error) {
      console.error("Failed to add shift", error);
      alert("Could not create new shift.");
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-gray-800">Timesheet</h2>
        <button onClick={handleManualAdd} className="bg-wii-light p-2 rounded-full text-wii-blue hover:bg-blue-100 transition-colors">
            <Plus size={24} />
        </button>
      </div>

      {sortedShifts.length === 0 && (
        <div className="text-center py-10 text-gray-400">No shifts recorded yet.</div>
      )}

      {sortedShifts.map((shift) => (
        <Card key={shift.id} className="relative overflow-hidden group">
            {/* Status Indicator Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${shift.endTime ? 'bg-gray-200' : 'bg-green-400 animate-pulse'}`} />
            
            <div className="pl-4">
                {editingId === shift.id ? (
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-gray-500">Start Time</label>
                        <input 
                            type="datetime-local" 
                            value={editForm.start}
                            onChange={(e) => setEditForm({...editForm, start: e.target.value})}
                            className="bg-gray-50 border rounded-lg p-2 text-sm"
                        />
                         <label className="text-xs font-bold text-gray-500">End Time</label>
                        <input 
                            type="datetime-local" 
                            value={editForm.end}
                            onChange={(e) => setEditForm({...editForm, end: e.target.value})}
                            className="bg-gray-50 border rounded-lg p-2 text-sm"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                             <button onClick={() => setEditingId(null)} className="p-2 bg-gray-200 rounded-full text-gray-600">
                                <X size={18} />
                             </button>
                             <button onClick={() => handleSave(shift.id)} className="p-2 bg-wii-blue rounded-full text-white">
                                <Check size={18} />
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-sm font-bold text-gray-400 mb-1">
                                {format(parseISO(shift.startTime), 'MMMM d, yyyy')}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display font-bold text-lg text-gray-800">
                                    {format(parseISO(shift.startTime), 'h:mm a')}
                                </span>
                                <span className="text-xs text-gray-400 ml-1">to</span>
                                <span className={`font-display font-bold text-lg ${shift.endTime ? 'text-gray-800' : 'text-green-500'}`}>
                                    {shift.endTime ? format(parseISO(shift.endTime), 'h:mm a') : 'Now'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(shift)} className="p-2 text-gray-400 hover:text-wii-blue hover:bg-blue-50 rounded-full">
                                <Edit2 size={20} />
                            </button>
                             <button onClick={() => onDeleteShift(shift.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
      ))}
    </div>
  );
};