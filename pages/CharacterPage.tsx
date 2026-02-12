
import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../App';
import { CharacterConfig, ShopItem } from '../types';

const SKIN_TONES = [
  { name: 'Fair', color: '#FFE0BD' },
  { name: 'Tan', color: '#D2B48C' },
  { name: 'Rich', color: '#8D5524' },
  { name: 'Dark', color: '#4E321D' },
];

const HAIR_STYLES = [
  { id: 'bald', name: 'Careca' },
  { id: 'short', name: 'Curto' },
  { id: 'spiky', name: 'Espetado' },
  { id: 'long', name: 'Longo' },
  { id: 'bob', name: 'Chanel' },
];

const HAIR_COLORS = [
  { name: 'Black', color: '#000000' },
  { name: 'Blonde', color: '#EBE07E' },
  { name: 'Brown', color: '#4B3621' },
  { name: 'Red', color: '#A52A2A' },
];

// Mock data for display purposes
const ALL_ITEMS_LIST: Record<string, string> = {
    'goku_gi': '#FF9900',
    'naruto_orange': '#FFA500',
    'luffy_vest': '#CC0000',
    'sailor_uniform': '#0000FF',
    'brazil_jersey': '#FFD700',
    'flamengo_jersey': '#CC0000',
    'real_madrid': '#FFFFFF',
    'nba_lakers': '#552583',
    'black_hoodie': '#111111',
    'white_tshirt': '#FFFFFF',
    'gym_shorts': '#333333',
    'yoga_pants': '#444444',
};

export const CharacterPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { user, updateCharacter, login } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'body' | 'clothes'>('body');
  
  const [config, setConfig] = useState<CharacterConfig>({
    gender: 'male',
    skinTone: SKIN_TONES[0].color,
    hairStyle: 'bald',
    hairColor: HAIR_COLORS[0].color,
    underwearColor: 'black',
    equippedItems: {}
  });

  useEffect(() => {
    if (user?.character) {
      setConfig(user.character);
    }
  }, [user]);

  if (!theme) return null;
  const { colors } = theme;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fadeIn px-6 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl">👤</div>
        <h1 className="text-3xl font-black mb-2" style={{ color: colors.textPrimary }}>Crie seu Avatar</h1>
        <button onClick={login} className="flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-md">
          <span className="font-bold text-gray-700">Entrar com Google</span>
        </button>
      </div>
    );
  }

  const handleSave = () => {
    updateCharacter(config);
    alert("Avatar atualizado!");
  };

  const handleEquip = (type: 'torso' | 'legs', itemId: string) => {
    const isAlreadyEquipped = config.equippedItems[type] === itemId;
    const newEquipped = { ...config.equippedItems, [type]: isAlreadyEquipped ? undefined : itemId };
    setConfig({ ...config, equippedItems: newEquipped });
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
      <header>
        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Avatar</h1>
        <p className="text-sm opacity-60" style={{ color: colors.textSecondary }}>Personalize seu visual</p>
      </header>

      <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl overflow-hidden flex items-center justify-center border-4 border-emerald-500/20 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <CharacterSVG config={config} />
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        <button onClick={() => setActiveMenu('body')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${activeMenu === 'body' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-40'}`}>🧬 CORPO</button>
        <button onClick={() => setActiveMenu('clothes')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${activeMenu === 'clothes' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-40'}`}>👕 ROUPAS</button>
      </div>

      {activeMenu === 'body' ? (
        <div className="flex flex-col gap-4">
            <section>
              <h3 className="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">Gênero</h3>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(g => (
                  <button key={g} onClick={() => setConfig({ ...config, gender: g })} className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${config.gender === g ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'opacity-50'}`}>{g === 'male' ? 'Masc' : 'Fem'}</button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">Pele</h3>
              <div className="flex justify-between">
                {SKIN_TONES.map(tone => (
                  <button key={tone.color} onClick={() => setConfig({ ...config, skinTone: tone.color })} className={`w-10 h-10 rounded-full border-4 ${config.skinTone === tone.color ? 'border-emerald-500 scale-110 shadow-lg' : 'border-transparent'}`} style={{ backgroundColor: tone.color }} />
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">Cabelo</h3>
              <div className="flex flex-wrap gap-2">
                {HAIR_STYLES.map(hair => (
                  <button key={hair.id} onClick={() => setConfig({ ...config, hairStyle: hair.id })} className={`px-4 py-2 rounded-xl border text-[10px] font-bold ${config.hairStyle === hair.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'opacity-50'}`}>{hair.name}</button>
                ))}
              </div>
            </section>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
            <section>
                <h3 className="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">Seu Inventário</h3>
                <div className="grid grid-cols-4 gap-2">
                    {user.inventory.length === 0 ? (
                        <p className="col-span-4 text-center py-6 text-xs opacity-40 italic">Vá à Loja comprar roupas!</p>
                    ) : (
                        user.inventory.map(itemId => {
                            const isEquippedTorso = config.equippedItems.torso === itemId;
                            const isEquippedLegs = config.equippedItems.legs === itemId;
                            const isEquipped = isEquippedTorso || isEquippedLegs;
                            const color = ALL_ITEMS_LIST[itemId] || '#CCCCCC';
                            const type = itemId.includes('shorts') || itemId.includes('pants') ? 'legs' : 'torso';

                            return (
                                <button 
                                    key={itemId} 
                                    onClick={() => handleEquip(type, itemId)}
                                    className={`aspect-square rounded-2xl border-4 transition-all relative overflow-hidden ${isEquipped ? 'border-emerald-500 scale-105 shadow-md' : 'border-transparent opacity-60'}`}
                                    style={{ backgroundColor: color }}
                                >
                                    {isEquipped && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
      )}

      <button onClick={handleSave} className="w-full py-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all">SALVAR AVATAR</button>
    </div>
  );
};

const CharacterSVG: React.FC<{ config: CharacterConfig }> = ({ config }) => {
  const { gender, skinTone, hairStyle, hairColor, underwearColor, equippedItems } = config;
  const underColor = underwearColor === 'black' ? '#1A1A1A' : '#F2F2F2';
  
  // Simulated clothing colors based on IDs (keep it simple for the SVG)
  const torsoColor = equippedItems.torso ? (ALL_ITEMS_LIST[equippedItems.torso] || '#FF9900') : null;
  const legsColor = equippedItems.legs ? (ALL_ITEMS_LIST[equippedItems.legs] || '#333333') : null;

  return (
    <svg width="240" height="240" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
      {/* Legs Base */}
      <path d="M78 140 L70 185" stroke={skinTone} strokeWidth={gender === 'male' ? "14" : "11"} strokeLinecap="round" />
      <path d="M122 140 L130 185" stroke={skinTone} strokeWidth={gender === 'male' ? "14" : "11"} strokeLinecap="round" />
      
      {/* Pants layer */}
      {legsColor && (
          <g>
            <path d="M78 140 L70 170" stroke={legsColor} strokeWidth={gender === 'male' ? "16" : "13"} strokeLinecap="round" />
            <path d="M122 140 L130 170" stroke={legsColor} strokeWidth={gender === 'male' ? "16" : "13"} strokeLinecap="round" />
          </g>
      )}

      {/* Body Base */}
      {gender === 'male' ? (
        <>
          <path d="M70 70 L130 70 L125 130 L75 130 Z" fill={skinTone} />
          {torsoColor && <path d="M70 70 L130 70 L125 130 L75 130 Z" fill={torsoColor} />}
          <path d="M75 120 H125 L125 140 L100 155 L75 140 Z" fill={legsColor || underColor} />
        </>
      ) : (
        <>
          <path d="M75 70 L125 70 Q130 100 115 130 L85 130 Q70 100 75 70" fill={skinTone} />
          {torsoColor && <path d="M75 70 L125 70 Q130 100 115 130 L85 130 Q70 100 75 70" fill={torsoColor} />}
          <path d="M75 80 Q100 85 125 80 L122 95 Q100 100 78 95 Z" fill={torsoColor || underColor} />
          <path d="M85 130 H115 L110 145 Q100 155 90 145 Z" fill={legsColor || underColor} />
        </>
      )}

      {/* Arms */}
      <path d="M75 75 L55 125" stroke={skinTone} strokeWidth={gender === 'male' ? "12" : "8"} strokeLinecap="round" />
      <path d="M125 75 L145 125" stroke={skinTone} strokeWidth={gender === 'male' ? "12" : "8"} strokeLinecap="round" />
      {torsoColor && (
          <g>
            <path d="M75 75 L60 105" stroke={torsoColor} strokeWidth={gender === 'male' ? "14" : "10"} strokeLinecap="round" />
            <path d="M125 75 L140 105" stroke={torsoColor} strokeWidth={gender === 'male' ? "14" : "10"} strokeLinecap="round" />
          </g>
      )}

      {/* Head */}
      <circle cx="100" cy="45" r="22" fill={skinTone} />
      <g stroke="black" strokeOpacity="0.3" strokeWidth="1" fill="none"><path d="M92 48 Q95 50 98 48" /><path d="M102 48 Q105 50 108 48" /><path d="M96 58 Q100 62 104 58" /></g>

      {/* Hair */}
      {hairStyle !== 'bald' && (
        <g fill={hairColor}>
          {hairStyle === 'short' && <path d="M78 40 Q100 20 122 40 L122 45 Q100 35 78 45 Z" />}
          {hairStyle === 'spiky' && <path d="M78 45 L82 30 L90 40 L100 20 L110 40 L118 30 L122 45 Z" />}
          {hairStyle === 'long' && <path d="M75 45 Q100 20 125 45 L130 90 Q120 85 115 90 L115 50 Q100 45 85 50 L85 90 Q80 85 70 90 Z" />}
          {hairStyle === 'bob' && <path d="M76 40 Q100 15 124 40 L128 75 Q128 85 115 80 Q100 80 85 80 Q72 85 72 75 Z" />}
        </g>
      )}
    </svg>
  );
};
