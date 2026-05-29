import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, MessageCircle, PhoneCall, Star, TrendingUp } from 'lucide-react';
import { BaseUrl } from '../../utils/constance';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BaseUrl}/admin/stats`, { withCredentials: true })
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: '#8a3fa0' },
    { label: 'Premium Users', value: stats.premiumUsers, icon: <Star size={24} />, color: '#f59e0b' },
    { label: 'Total Messages', value: stats.totalMessages, icon: <MessageCircle size={24} />, color: '#3b82f6' },
    { label: 'Total Calls', value: stats.totalCalls, icon: <PhoneCall size={24} />, color: '#10b981' },
    { label: 'Connections', value: stats.totalConnections, icon: <TrendingUp size={24} />, color: '#ec4899' },
    { label: 'New Today', value: stats.newUsersToday, icon: <Users size={24} />, color: '#c4789a' },
  ] : [];

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-8">Dashboard</h1>
      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner text-purple-400" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(c => (
            <div key={c.label}
              className="p-6 rounded-2xl border border-purple-800/30"
              style={{ background: 'rgba(138,63,160,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-purple-300 text-sm">{c.label}</p>
                <span style={{ color: c.color }}>{c.icon}</span>
              </div>
              <p className="text-4xl font-black text-white">{c.value?.toLocaleString?.() ?? c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
