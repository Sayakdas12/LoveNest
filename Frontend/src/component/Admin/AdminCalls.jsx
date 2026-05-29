import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Phone, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { BaseUrl } from '../../utils/constance';

const STATUS_COLORS = {
  completed: 'text-green-400',
  missed: 'text-red-400',
  rejected: 'text-orange-400',
  ongoing: 'text-blue-400',
};

function fmt(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AdminCalls() {
  const [calls, setCalls] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 25;

  const load = (p = page) => {
    setLoading(true);
    axios.get(`${BaseUrl}/admin/calls?page=${p}&limit=${limit}`, { withCredentials: true })
      .then(res => { setCalls(res.data.calls); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const pages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">
        Calls <span className="text-purple-400 text-xl font-normal">({total})</span>
      </h1>

      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner text-purple-400" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-purple-800/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-800/30" style={{ background: 'rgba(138,63,160,0.12)' }}>
                {['Type', 'Caller', 'Receiver', 'Status', 'Duration', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-purple-300 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calls.map(c => (
                <tr key={c._id} className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-colors">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-purple-300">
                      {c.type === 'video' ? <Video size={15} /> : <Phone size={15} />}
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {c.callerId?.firstName} {c.callerId?.lastName}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {c.receiverId?.firstName} {c.receiverId?.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${STATUS_COLORS[c.status] || 'text-purple-400'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-purple-300">{fmt(c.duration)}</td>
                  <td className="px-4 py-3 text-purple-400 text-xs">
                    {new Date(c.startedAt || c.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-5 text-sm text-purple-400">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }}
              className="p-2 rounded-lg disabled:opacity-30 hover:bg-purple-800/20 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button disabled={page === pages} onClick={() => { setPage(p => p + 1); load(page + 1); }}
              className="p-2 rounded-lg disabled:opacity-30 hover:bg-purple-800/20 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
