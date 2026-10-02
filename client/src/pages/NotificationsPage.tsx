import { useEffect, useState } from 'react';
import api from '../api';

function formatDate(value?: string) {
  if (!value) return 'Recent';
  try {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return 'Recent';
  }
}

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/notifications').then((res) => setItems(res.data.data || []));
  }, []);

  async function markRead(id: string) {
    await api.put(`/notifications/${id}/read`);
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">Notifications</h1>
        <p className="text-sm text-[#796B64] font-medium mt-0.5">Audit alerts and system updates</p>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel p-8 text-center space-y-3">
          <div className="text-base font-bold text-[#21130D]">No notifications</div>
          <p className="text-xs text-[#796B64]">You are all caught up! New alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className={`glass-panel p-4 flex items-start justify-between gap-3 ${
                item.read ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${item.read ? 'bg-[#A3948C]' : 'bg-[#611722]'}`} />
                <div>
                  <h3 className="font-bold text-sm text-[#21130D]">{item.title}</h3>
                  <p className="text-xs text-[#796B64] font-medium mt-0.5">{item.message}</p>
                  <span className="text-[10px] text-[#A3948C] font-semibold mt-1 block">{formatDate(item.createdAt)}</span>
                </div>
              </div>

              {!item.read && (
                <button
                  type="button"
                  onClick={() => markRead(item._id)}
                  className="text-[11px] font-bold text-[#611722] hover:underline flex-shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
