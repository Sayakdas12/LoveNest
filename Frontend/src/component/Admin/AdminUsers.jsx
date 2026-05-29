import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, ChevronLeft, ChevronRight, Trash2, ShieldCheck } from 'lucide-react';
import { BaseUrl } from '../../utils/constance';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const load = (p = page, q = search) => {
    setLoading(true);
    axios.get(`${BaseUrl}/admin/users?page=${p}&limit=${limit}&q=${encodeURIComponent(q)}`, { withCredentials: true })
      .then(res => { setUsers(res.data.users); setTotal(res.data.total); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await axios.patch(`${BaseUrl}/admin/users/${u._id}`, { role: newRole }, { withCredentials: true });
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, role: newRole } : x));
      toast.success(`${u.firstName} is now ${newRole}`);
    } catch { toast.error('Failed to update role'); }
  };

  const deleteUser = async (u) => {
    if (!confirm(`Delete ${u.firstName} ${u.lastName}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${BaseUrl}/admin/users/${u._id}`, { withCredentials: true });
      setUsers(prev => prev.filter(x => x._id !== u._id));
      setTotal(t => t - 1);
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">Users <span className="text-purple-400 text-xl font-normal">({total})</span></h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-purple-400 outline-none border border-purple-500/30 focus:border-pink-400/50"
            style={{ background: 'rgba(138,63,160,0.15)' }} />
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>Search</button>
      </form>

      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner text-purple-400" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-purple-800/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-800/30" style={{ background: 'rgba(138,63,160,0.12)' }}>
                {['User', 'Email', 'Role', 'Premium', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-purple-300 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" alt="" /> :
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
                            {u.firstName?.[0]}
                          </div>}
                      </div>
                      <span className="text-white font-medium">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-purple-300">{u.emailId}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-500/30 text-purple-200' : 'bg-gray-700/40 text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs ${u.isPremium ? 'bg-amber-500/20 text-amber-300' : 'text-gray-500'}`}>
                      {u.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-purple-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggleRole(u)} title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-purple-200 hover:bg-purple-800/30 transition-colors">
                        <ShieldCheck size={15} />
                      </button>
                      <button onClick={() => deleteUser(u)} title="Delete user"
                        className="p-1.5 rounded-lg text-red-400/60 hover:text-red-300 hover:bg-red-900/20 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
