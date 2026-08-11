import React, { useEffect, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import api from '../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data) setNotifications(res.data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" /> Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status updates, field assignments, and resolution verification alerts.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm divide-y divide-slate-100">
        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs">No notifications.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`py-4 flex items-start justify-between gap-4 ${!n.isRead ? 'bg-brand-50/40 -mx-6 px-6' : ''}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500"></span>}
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1">{new Date(n.createdAt).toLocaleString()}</span>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-100/50 rounded-xl transition-colors shrink-0"
                  title="Mark as Read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
