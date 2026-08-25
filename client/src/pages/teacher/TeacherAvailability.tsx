import React, { useState, useEffect } from 'react';
import { Clock, Check, Plus, Trash2 } from 'lucide-react';
import api from '../../api/client';

export const TeacherAvailability: React.FC = () => {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/teachers/availability');
        if (res.data.success) {
          setAvailability(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load availability:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleAddSlot = () => {
    setAvailability([...availability, { day: 'Monday', from: '09:00', to: '17:00' }]);
  };

  const handleRemoveSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, val: string) => {
    const updated = [...availability];
    updated[index][field] = val;
    setAvailability(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post('/teachers/availability', { availability });
      if (res.data.success) {
        alert('Availability schedule saved!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Faculty Availability Preferences
          </h1>
          <p className="text-sm text-slate-400">
            Define your working hours and availability for intelligent substitute allocations.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Availability'}</span>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white">Configured Availability Slots</h2>
          <button
            onClick={handleAddSlot}
            className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add Slot</span>
          </button>
        </div>

        <div className="space-y-3">
          {availability.map((slot, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/60"
            >
              <div className="w-full sm:w-1/3">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Day of Week
                </label>
                <select
                  value={slot.day}
                  onChange={(e) => handleChange(index, 'day', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-1/4">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={slot.from}
                  onChange={(e) => handleChange(index, 'from', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="w-full sm:w-1/4">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={slot.to}
                  onChange={(e) => handleChange(index, 'to', e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveSlot(index)}
                className="p-2 text-slate-500 hover:text-rose-400 mt-4 sm:mt-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
