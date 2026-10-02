import { useEffect, useState } from 'react';
import api from '../api';

function formatDate(value?: string) {
  if (!value) return 'Recent';
  try {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
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
    <div className="space-y-6">
      <div className="panel p-5 sm:p-6">
        <div className="kicker">Inbox</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#171717]">Notifications</h1>
      </div>

      {items.length === 0 ? (
        <div className="panel p-8 text-center">
          <div className="text-2xl">No notifications yet</div>
          <p className="mt-2 text-sm text-[#737373]">You’ll see audit alerts and updates here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className={`panel p-4 transition ${item.read ? 'opacity-80' : ''}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.read ? 'bg-[#D6D3D1]' : 'bg-[#5A0714]'}`} />
                  <div>
                    <div className="font-semibold text-[#171717]">{item.title}</div>
                    <div className="mt-1 text-sm text-[#737373]">{item.message}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#737373]">{formatDate(item.createdAt)}</div>
                  </div>
                </div>

                {!item.read && (
                  <button type="button" onClick={() => markRead(item._id)} className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-xs font-medium text-[#171717] transition hover:border-[#D5D1CE]">
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
