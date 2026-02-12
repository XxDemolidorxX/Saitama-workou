
import React, { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../App';
import { ShopItem } from '../types';

const SHOP_ITEMS: ShopItem[] = [
  // Anime (Expensive)
  { id: 'goku_gi', name: 'Kimono do Goku', category: 'anime', price: 500, gender: 'male', type: 'torso', color: '#FF9900' },
  { id: 'naruto_orange', name: 'Jaqueta Naruto', category: 'anime', price: 500, gender: 'both', type: 'torso', color: '#FFA500' },
  { id: 'luffy_vest', name: 'Colete do Luffy', category: 'anime', price: 450, gender: 'male', type: 'torso', color: '#CC0000' },
  { id: 'sailor_uniform', name: 'Uniforme Sailor', category: 'anime', price: 500, gender: 'female', type: 'torso', color: '#0000FF' },
  
  // Times (Medium)
  { id: 'brazil_jersey', name: 'Camisa do Brasil', category: 'times', price: 250, gender: 'both', type: 'torso', color: '#FFD700' },
  { id: 'flamengo_jersey', name: 'Manto Flamengo', category: 'times', price: 250, gender: 'both', type: 'torso', color: '#CC0000' },
  { id: 'real_madrid', name: 'Camisa Real Madrid', category: 'times', price: 200, gender: 'both', type: 'torso', color: '#FFFFFF' },
  { id: 'nba_lakers', name: 'Regata Lakers', category: 'times', price: 220, gender: 'both', type: 'torso', color: '#552583' },

  // Comum (Cheap)
  { id: 'black_hoodie', name: 'Moletom Preto', category: 'comum', price: 100, gender: 'both', type: 'torso', color: '#111111' },
  { id: 'white_tshirt', name: 'Camiseta Branca', category: 'comum', price: 50, gender: 'both', type: 'torso', color: '#FFFFFF' },
  { id: 'gym_shorts', name: 'Shorts de Treino', category: 'comum', price: 70, gender: 'both', type: 'legs', color: '#333333' },
  { id: 'yoga_pants', name: 'Legging Esportiva', category: 'comum', price: 80, gender: 'female', type: 'legs', color: '#444444' },
];

export const ShopPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { user, buyItem, login } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'anime' | 'times' | 'comum'>('anime');

  if (!theme) return null;
  const { colors } = theme;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fadeIn px-6 text-center">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-5xl">🛍️</div>
        <div>
          <h1 className="text-3xl font-black mb-2" style={{ color: colors.textPrimary }}>Loja de Heróis</h1>
          <p className="opacity-70" style={{ color: colors.textSecondary }}>Entre para começar a colecionar trajes épicos.</p>
        </div>
        <button onClick={login} className="flex items-center gap-3 bg-white border border-gray-300 px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-6 h-6" alt="Google" />
          <span className="font-bold text-gray-700">Entrar com Google</span>
        </button>
      </div>
    );
  }

  const filteredItems = SHOP_ITEMS.filter(item => 
    item.category === activeCategory && 
    (item.gender === 'both' || item.gender === user.character?.gender)
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Loja</h1>
          <p className="text-sm opacity-60" style={{ color: colors.textSecondary }}>Troque ouro por poder visual</p>
        </div>
        <div className="bg-yellow-400/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-yellow-400/30">
          <span className="text-lg font-black text-yellow-600">💰 {user.coins}</span>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        {(['anime', 'times', 'comum'] as const).map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase transition-all ${activeCategory === cat ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50'}`}
          >
            {cat === 'anime' ? '🌟 Anime' : cat === 'times' ? '⚽ Times' : '👕 Comum'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const isOwned = user.inventory.includes(item.id);
          const canAfford = user.coins >= item.price;
          
          return (
            <div 
              key={item.id} 
              className="p-4 rounded-3xl border flex flex-col gap-3 transition-all hover:scale-[1.02]"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div 
                    className="w-16 h-16 rounded-xl shadow-lg border-2 border-white/50" 
                    style={{ backgroundColor: item.color }} 
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/10 rounded-full text-[8px] font-black uppercase">
                  {item.type}
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-black truncate" style={{ color: colors.textPrimary }}>{item.name}</h3>
                <p className="text-[10px] opacity-40 uppercase tracking-tighter">Categoria {item.category}</p>
              </div>

              <button 
                onClick={() => {
                  if (isOwned) return;
                  if (!canAfford) {
                    alert("Você não tem ouro suficiente!");
                    return;
                  }
                  if (buyItem(item)) alert(`${item.name} comprado!`);
                }}
                disabled={isOwned}
                className={`w-full py-2 rounded-xl text-[10px] font-black transition-all ${isOwned ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-emerald-500 text-white active:scale-95'}`}
              >
                {isOwned ? 'JÁ POSSUI' : `💰 ${item.price}`}
              </button>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-20 text-center opacity-40 italic">Nenhum item nesta categoria disponível para o seu gênero.</div>
      )}
    </div>
  );
};
