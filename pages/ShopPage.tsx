
import React, { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../App';
import { ShopItem } from '../types';
import { PixelAvatar } from './CharacterPage';

const SHOP_ITEMS: ShopItem[] = [
  { id: 'saitama', name: 'One Punch', category: 'anime', price: 1000 },
  { id: 'goku', name: 'Saiyan God', category: 'anime', price: 800 },
  { id: 'naruto', name: 'Hokage', category: 'anime', price: 800 },
  { id: 'luffy', name: 'Pirate King', category: 'anime', price: 800 },
  { id: 'zoro', name: 'Hunter', category: 'anime', price: 750 },
];

export const ShopPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { user, buyItem, openLogin } = useAuth();

  if (!theme) return null;
  const { colors } = theme;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fadeIn px-6 text-center">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-5xl">🛍️</div>
        <div>
          <h1 className="text-3xl font-black mb-2" style={{ color: colors.textPrimary }}>Loja de Lendas</h1>
          <p className="opacity-70" style={{ color: colors.textSecondary }}>Faça login para desbloquear guerreiros supremos.</p>
        </div>
        <button onClick={openLogin} className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg">Entrar Agora</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Loja</h1>
          <p className="text-sm opacity-60" style={{ color: colors.textSecondary }}>Avatares nível Deus</p>
        </div>
        <div className="bg-yellow-400/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-yellow-400/30">
          <span className="text-lg font-black text-yellow-600">💰 {user.coins}</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {SHOP_ITEMS.map(item => {
          const isOwned = user.inventory.includes(item.id);
          const canAfford = user.coins >= item.price;
          
          return (
            <div 
              key={item.id} 
              className="p-4 rounded-3xl border flex flex-col gap-4 transition-all hover:shadow-xl bg-white dark:bg-gray-800 items-center text-center relative overflow-hidden group"
              style={{ borderColor: colors.border }}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="transform transition-transform group-hover:scale-110 duration-300 p-2 h-24 flex items-center justify-center">
                 <PixelAvatar id={item.id} size={90} />
              </div>
              
              <div className="flex-1 w-full z-10">
                <h3 className="text-sm font-black truncate" style={{ color: colors.textPrimary }}>{item.name}</h3>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-3">Lendário</p>

                <button 
                    onClick={() => {
                    if (isOwned) return;
                    if (!canAfford) {
                        alert("Você precisa de mais moedas! Treine mais para ganhar.");
                        return;
                    }
                    if (buyItem(item)) {
                        if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
                        alert(`Você adquiriu ${item.name}!`);
                    }
                    }}
                    disabled={isOwned}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all ${isOwned ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-yellow-400 text-yellow-900 active:scale-95 shadow-lg hover:bg-yellow-300'}`}
                >
                    {isOwned ? 'JÁ POSSUI' : `💰 ${item.price}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
