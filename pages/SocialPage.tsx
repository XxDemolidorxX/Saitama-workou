
import React, { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../App';

export const SocialPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { user, friends, leaderboard, login, addFriend } = useAuth();
  const [friendCode, setFriendCode] = useState('');
  const [activeTab, setActiveTab] = useState<'ranks' | 'friends'>('ranks');

  if (!theme) return null;
  const { colors } = theme;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fadeIn px-6 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl">🥚</div>
        <div>
          <h1 className="text-3xl font-black mb-2" style={{ color: colors.textPrimary }}>Torne-se uma Lenda</h1>
          <p className="opacity-70" style={{ color: colors.textSecondary }}>Sincronize seus treinos e desafie seus amigos para o Rank Global.</p>
        </div>
        <button 
          onClick={login}
          className="flex items-center gap-3 bg-white border border-gray-300 px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-6 h-6" alt="Google" />
          <span className="font-bold text-gray-700">Entrar com Google</span>
        </button>
      </div>
    );
  }

  const handleAddFriend = () => {
    if (addFriend(friendCode.toUpperCase())) {
      alert("Amigo adicionado com sucesso!");
      setFriendCode('');
    } else {
      alert("Código inválido ou já adicionado.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Social</h1>
          <p className="text-sm opacity-60" style={{ color: colors.textSecondary }}>Ranking e Amigos</p>
        </div>
        <img src={user.photo} className="w-12 h-12 rounded-full border-2 border-emerald-500" alt="Profile" />
      </header>

      {/* User Code Sharing */}
      <section 
        className="p-5 rounded-3xl border flex flex-col items-center gap-3"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <span className="text-xs uppercase font-black opacity-40 tracking-widest">Meu Saitama Code</span>
        <div className="flex items-center gap-3">
          <code className="text-2xl font-mono font-black text-emerald-500">{user.saitamaCode}</code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(user.saitamaCode);
              alert("Código copiado!");
            }}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        <button 
          onClick={() => setActiveTab('ranks')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'ranks' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50'}`}
        >
          RANK GLOBAL
        </button>
        <button 
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'friends' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50'}`}
        >
          AMIGOS ({friends.length})
        </button>
      </div>

      {activeTab === 'ranks' ? (
        <div className="flex flex-col gap-2">
          {leaderboard.map((entry, idx) => (
            <div 
              key={entry.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${entry.isMe ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500' : ''}`}
              style={{ backgroundColor: colors.card, borderColor: entry.isMe ? colors.primary : colors.border }}
            >
              <span className={`w-6 font-black ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'opacity-30'}`}>
                {idx + 1}
              </span>
              <img src={entry.photo} className="w-10 h-10 rounded-full" alt={entry.name} />
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>{entry.name} {entry.isMe && '(Você)'}</p>
                <p className="text-[10px] opacity-50 uppercase font-black">{entry.totalWorkouts} Treinos</p>
              </div>
              {idx < 3 && <span className="text-xl">{idx === 0 ? '🏆' : idx === 1 ? '🥈' : '🥉'}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Código do Amigo (Ex: SAI-AB12)"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border font-mono bg-transparent"
              style={{ borderColor: colors.border }}
            />
            <button 
              onClick={handleAddFriend}
              className="px-6 rounded-xl bg-emerald-500 text-white font-bold text-sm"
            >
              Add
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {friends.length === 0 ? (
              <div className="py-20 text-center opacity-40">Nenhum amigo ainda.</div>
            ) : (
              friends.map(friend => (
                <div 
                  key={friend.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <div className="relative">
                    <img src={friend.photo} className="w-10 h-10 rounded-full" alt={friend.name} />
                    {friend.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>{friend.name}</p>
                    <p className="text-[10px] opacity-50 font-mono tracking-tighter">{friend.saitamaCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] opacity-40 italic">Visto em</p>
                    <p className="text-[10px] font-bold">{new Date(friend.lastWorkout).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
