
import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../App';

// --- HIGH FIDELITY ASSET SYSTEM ---
// Instead of drawing 10,000 rectangles manually, we use high-quality 
// animated sprites (GIFs) or static PNGs from classic fighting games.
// This allows for 96x96, 192x192 or even higher resolution pixel art.

const AVATAR_ASSETS: Record<string, string> = {
    // Defaults (Generic RPG Style)
    'default_male': 'https://media.tenor.com/J3-w-H1pS9QAAAAi/idle-pixel.gif', 
    'default_female': 'https://i.pinimg.com/originals/a4/09/44/a40944cb2d69903e0539dec7662c16c0.gif',
    
    // Anime Characters (High Quality Fighting Game Sprites)
    'saitama': 'https://media.tenor.com/0P6J0yC0K-AAAAAi/saitama-one-punch-man.gif',
    'goku': 'https://media.tenor.com/2s90kZ4VuxMAAAAi/goku-pixel.gif', // Idle animation
    'naruto': 'https://media.tenor.com/N-Eq_TeWlOAAAAAi/naruto-pixel.gif',
    'luffy': 'https://media.tenor.com/P1f-g1-N1KAAAAAi/luffy-pixel.gif',
    'zoro': 'https://media.tenor.com/7l6gJ3vL8ToAAAAi/roronoa-zoro-one-piece.gif',
};

export const PixelAvatar: React.FC<{ id: string, size?: number, className?: string }> = ({ id, size = 120, className = '' }) => {
    const src = AVATAR_ASSETS[id] || AVATAR_ASSETS['default_male'];

    return (
        <div 
            className={`relative flex items-center justify-center overflow-hidden ${className}`}
            style={{ width: size, height: size }}
        >
            <img 
                src={src} 
                alt={id}
                className="w-full h-full object-contain pointer-events-none drop-shadow-lg"
                style={{ 
                    imageRendering: 'pixelated', // Keeps pixel art sharp even when scaled up
                    filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))'
                }} 
            />
        </div>
    );
};

export const CharacterPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { user, setAvatar, openLogin, updateName } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  useEffect(() => {
    if (user) setNewName(user.name);
  }, [user]);

  if (!theme) return null;
  const { colors } = theme;

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-gray-500">Faça login para customizar seu herói.</p>
        <button onClick={openLogin} className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold">LOGIN</button>
    </div>
  );

  const handleSaveName = () => {
    const res = updateName(newName);
    alert(res.message);
    if (res.success) setEditingName(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-20">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black" style={{ color: colors.textPrimary }}>Seu Avatar</h1>
            <button onClick={() => setEditingName(true)} className="text-emerald-500 text-xs font-bold uppercase hover:bg-emerald-50 p-2 rounded">
                ✏️ Editar Nome
            </button>
        </div>
        {editingName ? (
            <div className="flex gap-2">
                <input 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="flex-1 bg-gray-100 p-3 rounded-xl border border-gray-300 font-bold text-gray-800"
                    placeholder="Seu nome de herói"
                />
                <button onClick={handleSaveName} className="bg-emerald-500 text-white px-4 rounded-xl font-bold">OK</button>
            </div>
        ) : (
            <p className="text-emerald-600 font-black text-xl">@{user.name}</p>
        )}
      </header>

      {/* Main Preview - High Quality Display */}
      <div className="flex items-center justify-center py-12 bg-gradient-to-b from-blue-50 to-white rounded-3xl border-2 border-gray-100 shadow-inner overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          {/* Animated Background Aura */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-48 h-48 bg-yellow-400 blur-3xl opacity-30 animate-pulse rounded-full"></div>
          </div>

          <div className="relative z-10 transform transition-transform duration-500 hover:scale-110">
             <PixelAvatar id={user.currentAvatarId} size={220} />
             
             {/* Floor shadow */}
             <div className="w-32 h-4 bg-black/20 rounded-[100%] blur-sm mx-auto -mt-4"></div>
          </div>
      </div>

      <div className="flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Meus Personagens</h3>
          <div className="grid grid-cols-3 gap-4">
              {user.inventory.map(avatarId => (
                  <button 
                    key={avatarId}
                    onClick={() => setAvatar(avatarId)}
                    className={`aspect-square rounded-2xl border-4 flex flex-col items-center justify-center bg-gray-50 transition-all active:scale-95 hover:shadow-lg relative overflow-hidden ${user.currentAvatarId === avatarId ? 'border-emerald-500 bg-emerald-50 shadow-emerald-200 ring-2 ring-emerald-200' : 'border-transparent'}`}
                  >
                      <PixelAvatar id={avatarId} size={70} />
                      {user.currentAvatarId === avatarId && (
                        <div className="absolute bottom-0 w-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-tighter py-1 text-center">
                            Equipado
                        </div>
                      )}
                  </button>
              ))}
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-2xl flex items-center justify-between mt-4 shadow-sm group">
              <span className="text-xs font-bold text-yellow-800">Colecione mais heróis lendários!</span>
              <a href="#/shop" className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl text-xs font-black shadow-sm group-hover:bg-yellow-300 transition-colors group-hover:scale-105 transform">LOJA</a>
          </div>
      </div>
    </div>
  );
};
