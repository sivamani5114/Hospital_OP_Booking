// AppointmentSlotPicker.jsx — Visual smart slot picker with availability indicators
import React, { useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const MORNING_SLOTS = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const AFTERNOON_SLOTS = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'];
const EVENING_SLOTS = ['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'];

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      dateStr: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    });
  }
  return days;
}

function SlotButton({ slot, bookedSlots, selected, onSelect }) {
  const isBooked = bookedSlots.includes(slot);
  const isSelected = selected === slot;

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={() => !isBooked && onSelect(slot)}
      className={`
        relative px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1
        ${isBooked
          ? 'bg-rose-500/5 border-rose-500/20 text-rose-400/50 cursor-not-allowed line-through'
          : isSelected
            ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/30'
            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300'
        }
      `}
    >
      {isBooked ? <XCircle className="w-3 h-3" /> : isSelected ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3 opacity-50" />}
      {slot}
      {isBooked && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] px-1 rounded-full font-bold">FULL</span>}
    </button>
  );
}

export default function AppointmentSlotPicker({ doctorId, existingBookings = [], selectedDate, selectedTime, onDateChange, onTimeChange }) {
  const days = getNext7Days();
  const [dayOffset, setDayOffset] = useState(0);

  // Get already booked time slots for selected date + doctor
  const bookedSlots = existingBookings
    .filter(b => b.doctorId === doctorId && b.date === selectedDate && b.status !== 'Cancelled')
    .map(b => b.time);

  const availableMorning = MORNING_SLOTS.filter(s => !bookedSlots.includes(s)).length;
  const availableAfternoon = AFTERNOON_SLOTS.filter(s => !bookedSlots.includes(s)).length;
  const availableEvening = EVENING_SLOTS.filter(s => !bookedSlots.includes(s)).length;

  return (
    <div className="space-y-4">
      {/* Date Selector Strip */}
      <div>
        <label className="text-slate-400 font-semibold block mb-2 text-xs">📅 Select Appointment Date</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
            disabled={dayOffset === 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          <div className="flex-1 grid grid-cols-4 gap-1.5 overflow-hidden">
            {days.slice(dayOffset, dayOffset + 4).map(d => (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => { onDateChange(d.dateStr); onTimeChange(''); }}
                className={`p-2 rounded-xl text-center transition-all border ${
                  selectedDate === d.dateStr
                    ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                    : d.isWeekend
                      ? 'bg-slate-900 border-amber-500/20 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500/30'
                }`}
              >
                <div className="text-[10px] font-bold">{d.label}</div>
                <div className="text-[11px] mt-0.5">{d.day}</div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDayOffset(Math.min(3, dayOffset + 1))}
            disabled={dayOffset >= 3}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Slot Availability Legend */}
      {selectedDate && (
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Selected</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700 inline-block" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Booked</span>
        </div>
      )}

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-3">
          {/* Morning */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">🌅 Morning</span>
              <span className="text-[10px] text-slate-500">({availableMorning} slots free)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MORNING_SLOTS.map(s => (
                <SlotButton key={s} slot={s} bookedSlots={bookedSlots} selected={selectedTime} onSelect={onTimeChange} />
              ))}
            </div>
          </div>

          {/* Afternoon */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">☀️ Afternoon</span>
              <span className="text-[10px] text-slate-500">({availableAfternoon} slots free)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AFTERNOON_SLOTS.map(s => (
                <SlotButton key={s} slot={s} bookedSlots={bookedSlots} selected={selectedTime} onSelect={onTimeChange} />
              ))}
            </div>
          </div>

          {/* Evening */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">🌙 Evening</span>
              <span className="text-[10px] text-slate-500">({availableEvening} slots free)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {EVENING_SLOTS.map(s => (
                <SlotButton key={s} slot={s} bookedSlots={bookedSlots} selected={selectedTime} onSelect={onTimeChange} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
