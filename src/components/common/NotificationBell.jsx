// NotificationBell.jsx — In-app notification bell with badge + dropdown
import React, { useState, useEffect } from 'react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, X, CheckCheck, Calendar, Star, AlertCircle } from 'lucide-react';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const { notifications, markNotificationRead, clearNotifications, bookings, addNotification } = useDb();
  const [open, setOpen] = useState(false);

  // Filter notifications for current user
  const myNotifs = notifications.filter(n => n.userId === currentUser?._id || n.userId === currentUser?.phone);
  const unread = myNotifs.filter(n => !n.read).length;

  // On mount: check upcoming appointments within 24h and create reminder notifications
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'USER') return;

    const today = new Date();
    const userBookings = bookings.filter(b =>
      (b.userId === currentUser._id || b.userPhone === currentUser.phone) && b.status === 'Confirmed'
    );

    userBookings.forEach(b => {
      const apptDate = new Date(b.date);
      const diffHours = (apptDate - today) / (1000 * 60 * 60);

      if (diffHours > 0 && diffHours <= 48) {
        const alreadyExists = notifications.some(n =>
          n.bookingId === b._id && n.type === 'REMINDER'
        );
        if (!alreadyExists) {
          addNotification({
            userId: currentUser._id,
            type: 'REMINDER',
            bookingId: b._id,
            icon: '📅',
            title: 'Upcoming Appointment Reminder',
            message: `Your OP with ${b.doctorName} at ${b.hospitalName} is on ${b.date} at ${b.time}.`,
          });
        }
      }
    });
  }, [bookings, currentUser]);

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all"
      >
        <Bell className="w-4 h-4 text-slate-400" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 glass-panel border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" /> Notifications
              {unread > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread} new</span>}
            </h4>
            <div className="flex items-center gap-2">
              {myNotifs.length > 0 && (
                <button onClick={clearNotifications} className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
            {myNotifs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              myNotifs.map(n => (
                <div
                  key={n._id}
                  onClick={() => markNotificationRead(n._id)}
                  className={`p-4 cursor-pointer hover:bg-slate-900/50 transition-all ${!n.read ? 'bg-cyan-500/5 border-l-2 border-cyan-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{n.icon || '🔔'}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1 shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
