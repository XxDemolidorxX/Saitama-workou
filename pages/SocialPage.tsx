
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
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl text-white">🏆</div>
        <h1 className="text-3xl font-black" style={{ color: colors.textPrimary }}>Login com Google</h1>
        <button onClick={login} className="bg-white border p-4 rounded-full shadow-lg flex items-center gap-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-6" alt="G" />
          <span className="font-bold">Escolher Conta do Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black" style={{ color: colors.textPrimary }}>Comunidade</h1>
          <p className="text-sm opacity-60" style={{ color: colors.textSecondary }}>A união faz a força do herói</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] font-black text-emerald-600">@{user.name}</p>
        </div>
      </header>

      {/* Same Social UI but with new names */}
       <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        <button onClick={() => setActiveTab('ranks')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${activeTab === 'ranks' ? 'bg-white shadow-sm' : 'opacity-50'}`}>RANK GLOBAL</button>
        <button onClick={() => setActiveTab('friends')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${activeTab === 'friends' ? 'bg-white shadow-sm' : 'opacity-50'}`}>AMIGOS</button>
      </div>

      {activeTab === 'ranks' && (
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry, idx) => (
                <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${entry.isMe ? 'border-emerald-500 bg-emerald-50' : 'bg-white border-gray-100'}`}>
                    <span className="w-5 font-black opacity-30">{idx + 1}</span>
                    <img src={entry.photo} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="P" />
                    <div className="flex-1">
                        <p className="font-bold text-sm">{entry.name} {entry.isMe && '(Você)'}</p>
                        <p className="text-[10px] opacity-40 uppercase font-black">{entry.totalWorkouts} Treinos</p>
                    </div>
                    {idx < 3 && <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>}
                </div>
            ))}
          </div>
      )}

      {activeTab === 'friends' && (
          <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                  <input value={friendCode} onChange={e => setFriendCode(e.target.value.toUpperCase())} placeholder="Saitama Code (Ex: SAI-XXXX)" className="flex-1 p-3 rounded-xl border border-gray-200 font-mono text-sm" />
                  <button onClick={() => { if(addFriend(friendCode)) { alert("Amigo Add!"); setFriendCode(""); } }} className="bg-emerald-500 text-white px-6 rounded-xl font-bold">ADD</button>
              </div>
              {friends.map(f => (
                   <div key={f.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100">
                        <img src={f.photo} className="w-10 h-10 rounded-full" alt="P" />
                        <div className="flex-1">
                            <p className="font-bold text-sm">{f.name}</p>
                            <p className="text-[10px] font-mono opacity-40">{f.saitamaCode}</p>
                        </div>
                        {f.isOnline && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                   </div>
              ))}
          </div>
      )}
    </div>
  );
};
