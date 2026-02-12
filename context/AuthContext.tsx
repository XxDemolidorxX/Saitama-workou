
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Friend, RankEntry, ShopItem } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  friends: Friend[];
  leaderboard: RankEntry[];
  showLoginModal: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  performLogin: (selectedEmail: string, selectedName: string, photo: string) => void;
  logout: () => void;
  addFriend: (code: string) => boolean;
  setAvatar: (avatarId: string) => void;
  updateName: (newName: string) => { success: boolean, message: string };
  addXP: (amount: number) => void;
  buyItem: (item: ShopItem) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Mock data representing a database
  const [leaderboard, setLeaderboard] = useState<RankEntry[]>([
    { id: '1', name: 'Goku_Shape', totalWorkouts: 9001, photo: 'https://i.pravatar.cc/150?u=goku' },
    { id: '2', name: 'Vegeta_Orgulhoso', totalWorkouts: 8999, photo: 'https://i.pravatar.cc/150?u=vegeta' },
    { id: '3', name: 'Luffy_G5', totalWorkouts: 500, photo: 'https://i.pravatar.cc/150?u=luffy' },
    { id: '4', name: 'Naruto_Fit', totalWorkouts: 450, photo: 'https://i.pravatar.cc/150?u=naruto' },
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('saitama_user');
    const savedFriends = localStorage.getItem('saitama_friends');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFriends) setFriends(JSON.parse(savedFriends));
  }, []);

  const openLogin = () => setShowLoginModal(true);
  const closeLogin = () => setShowLoginModal(false);

  const performLogin = (selectedEmail: string, selectedName: string, photo: string) => {
    const randomCode = 'SAI-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    let finalName = selectedName.split(' ')[0];
    if (leaderboard.some(l => l.name === finalName)) {
        finalName = `${finalName}_${Math.floor(Math.random() * 99)}`;
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name: finalName,
      email: selectedEmail,
      photo: photo,
      saitamaCode: randomCode,
      totalWorkouts: 0,
      xp: 0,
      coins: 500,
      inventory: ['default_male', 'default_female'], // Start with defaults
      currentAvatarId: 'default_male'
    };
    setUser(newUser);
    localStorage.setItem('saitama_user', JSON.stringify(newUser));
    setShowLoginModal(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('saitama_user');
  };

  const updateName = (newName: string) => {
    const cleanName = newName.trim().substring(0, 20);
    if (!cleanName || cleanName.length < 3) return { success: false, message: "Nome deve ter min 3 letras" };
    
    const isTaken = leaderboard.some(entry => entry.name.toLowerCase() === cleanName.toLowerCase());
    if (isTaken) return { success: false, message: "Este nome já está em uso por outro herói!" };

    if (user) {
      const updatedUser = { ...user, name: cleanName };
      setUser(updatedUser);
      localStorage.setItem('saitama_user', JSON.stringify(updatedUser));
      return { success: true, message: "Identidade secreta atualizada!" };
    }
    return { success: false, message: "Erro ao atualizar" };
  };

  const setAvatar = (avatarId: string) => {
    if (!user) return;
    if (!user.inventory.includes(avatarId)) return; // Security check
    const updatedUser = { ...user, currentAvatarId: avatarId };
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
      newCoins += (newLevel - oldLevel) * 50; 
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

  const addFriend = (code: string) => {
    if (code === user?.saitamaCode) return false;
    if (friends.some(f => f.saitamaCode === code)) return false;
    
    const newFriend: Friend = {
      id: crypto.randomUUID(),
      name: `User_${code.split('-')[1]}`,
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
    <AuthContext.Provider value={{ user, friends, leaderboard: sortedLeaderboard, showLoginModal, openLogin, closeLogin, performLogin, logout, addFriend, setAvatar, updateName, addXP, buyItem }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
