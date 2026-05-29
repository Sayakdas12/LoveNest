import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutDashboard, Users, PhoneCall, ArrowLeft } from 'lucide-react';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
  { to: '/admin/calls', label: 'Calls', icon: <PhoneCall size={18} /> },
];

export default function AdminLayout() {
  const user = useSelector(s => s.user);
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-300">
        <div className="text-center">
          <p className="text-xl mb-4">Access denied.</p>
          <button onClick={() => navigate('/')} className="underline hover:text-pink-300">Go home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-purple-800/30 py-8 px-4"
        style={{ background: 'rgba(30,9,48,0.9)' }}>
        <div className="mb-8">
          <p className="text-xs text-purple-500 uppercase tracking-widest mb-1">Admin</p>
          <h2 className="text-white font-bold text-lg">Control Panel</h2>
        </div>
        <nav className="space-y-1">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-purple-400 hover:text-white hover:bg-purple-800/20'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, rgba(138,63,160,0.3), rgba(196,120,154,0.15))' } : {}}
            >
              {n.icon}{n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-purple-400 hover:text-pink-300 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to App
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
