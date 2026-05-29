import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';

const PACKS = null; // fetched from server

export default function StickerPicker({ onSelect }) {
  const [packs, setPacks] = useState([]);
  const [activePack, setActivePack] = useState(0);

  useEffect(() => {
    axios.get(`${BaseUrl}/stickers`, { withCredentials: true })
      .then(res => {
        setPacks(res.data.packs || []);
      })
      .catch(() => {});
  }, []);

  if (!packs.length) return (
    <div className="p-4 text-center text-purple-400 text-sm">
      <span className="loading loading-spinner loading-xs" />
    </div>
  );

  return (
    <div className="w-72 rounded-2xl border border-purple-500/30 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a0928, #12061e)' }}>

      {/* Pack tabs */}
      <div className="flex border-b border-purple-800/30">
        {packs.map((pack, i) => (
          <button
            key={pack.name}
            onClick={() => setActivePack(i)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              i === activePack ? 'text-pink-300 border-b-2 border-pink-400' : 'text-purple-400 hover:text-purple-200'
            }`}
          >
            {pack.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="p-3 grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
        {packs[activePack]?.stickers?.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect?.(s)}
            title={s.label}
            className="text-2xl flex items-center justify-center w-9 h-9 rounded-xl hover:bg-purple-700/30 transition-colors"
          >
            {s.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
