
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Friend, RankEntry, CharacterConfig, ShopItem } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  friends: Friend[];
  leaderboard: RankEntry[];
  login: () => void;
  logout: () => void;
  addFriend: (code: string) => boolean;
  updateCharacter: (config: CharacterConfig) => void;
  addXP: (amount: number) => void;
  buyItem: (item: ShopItem) => boolean;
  equipItem: (item: ShopItem) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);

  const [leaderboard] = useState<RankEntry[]>([
    { id: '1', name: 'Genos', totalWorkouts: 342, photo: 'https://i.pravatar.cc/150?u=genos' },
    { id: '2', name: 'Mumen Rider', totalWorkouts: 215, photo: 'https://i.pravatar.cc/150?u=mumen' },
    { id: '3', name: 'King', totalWorkouts: 1, photo: 'https://i.pravatar.cc/150?u=king' },
    { id: '4', name: 'Bang', totalWorkouts: 180, photo: 'https://i.pravatar.cc/150?u=bang' },
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('saitama_user');
    const savedFriends = localStorage.getItem('saitama_friends');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFriends) setFriends(JSON.parse(savedFriends));
  }, []);

  const login = () => {
    const randomCode = 'SAI-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name: "Saitama Apprentice",
      email: "herofun@gmail.com",
      photo: "https://i.pravatar.cc/150?u=saitama",
      saitamaCode: randomCode,
      totalWorkouts: 0,
      xp: 0,
      coins: 500, // Initial balance
      inventory: [],
      character: {
        gender: 'male',
        skinTone: '#FFE0BD',
        hairStyle: 'bald',
        hairColor: '#000000',
        underwearColor: 'black',
        equippedItems: {}
      }
    };
    setUser(newUser);
    localStorage.setItem('saitama_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('saitama_user');
  };

  const updateCharacter = (config: CharacterConfig) => {
    if (!user) return;
    const updatedUser = { ...user, character: config };
    setUser(updatedUser);
    localStorage.setItem('saitama_user', JSON.stringify(updatedUser));
  };

  const addXP = (amount: number) => {
    if (!user) return;
    const oldLevel = Math.floor(user.xp / 10);
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 10);
    
    let newCoins = user.coins;
    if (newLevel > oldLevel) {
      newCoins += (newLevel - oldLevel) * 100; // 100 coins per level
    }

    const updatedUser = { ...user, xp: newXP, coins: newCoins, totalWorkouts: user.totalWorkouts + 1 };
    setUser(updatedUser);
    localStorage.setItem('saitama_user', JSON.stringify(updatedUser));
  };

  const buyItem = (item: ShopItem) => {
    if (!user || user.coins < item.price || user.inventory.includes(item.id)) return false;
    
    const updatedUser = { 
      ...user, 
      coins: user.coins - item.price, 
      inventory: [...user.inventory, item.id] 
    };
    setUser(updatedUser);
    localStorage.setItem('saitama_user', JSON.stringify(updatedUser));
    return true;
  };

  const equipItem = (item: ShopItem) => {
    if (!user || !user.character) return;
    const updatedEquipped = { ...user.character.equippedItems, [item.type]: item.id };
    updateCharacter({ ...user.character, equippedItems: updatedEquipped });
  };

  const addFriend = (code: string) => {
    if (code === user?.saitamaCode) return false;
    if (friends.some(f => f.saitamaCode === code)) return false;
    
    const newFriend: Friend = {
      id: crypto.randomUUID(),
      name: `Guerreiro ${code.split('-')[1]}`,
      photo: `https://i.pravatar.cc/150?u=${code}`,
      saitamaCode: code,
      isOnline: Math.random() > 0.5,
      lastWorkout: new Date().toISOString()
    };
    
    const updated = [...friends, newFriend];
    setFriends(updated);
    localStorage.setItem('saitama_friends', JSON.stringify(updated));
    return true;
  };

  const sortedLeaderboard = user 
    ? [...leaderboard, { id: user.id, name: user.name, totalWorkouts: user.totalWorkouts, photo: user.photo, isMe: true }]
        .sort((a, b) => b.totalWorkouts - a.totalWorkouts)
    : leaderboard.sort((a, b) => b.totalWorkouts - a.totalWorkouts);

  return (
    <AuthContext.Provider value={{ user, friends, leaderboard: sortedLeaderboard, login, logout, addFriend, updateCharacter, addXP, buyItem, equipItem }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
