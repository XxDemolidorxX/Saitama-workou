
export enum WorkoutStatus {
  NAO_DEFINIDO = 'NAO_DEFINIDO',
  FEITO = 'FEITO',
  NAO_FIZ = 'NAO_FIZ'
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  category: 'anime' | 'original' | 'premium';
}

export interface WorkoutEntry {
  id: string;
  date: string;
  flexoes: boolean;
  abdominais: boolean;
  agachamentos: boolean;
  km: number;
  status: WorkoutStatus;
  isDoubled?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo: string;
  saitamaCode: string;
  totalWorkouts: number;
  currentAvatarId: string; // Changed from CharacterConfig object to a simple ID
  xp: number;
  coins: number;
  inventory: string[]; // List of owned Avatar IDs
}

export interface Friend {
  id: string;
  name: string;
  photo: string;
  saitamaCode: string;
  isOnline: boolean;
  lastWorkout: string;
}

export interface RankEntry {
  id: string;
  name: string;
  totalWorkouts: number;
  photo: string;
  isMe?: boolean;
}

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

export interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: ThemeColors;
}
