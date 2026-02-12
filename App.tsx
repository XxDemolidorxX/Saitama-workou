import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { TodayPage } from './pages/TodayPage';
import { CalendarPage } from './pages/CalendarPage';
import { SocialPage } from './pages/SocialPage';
import { CharacterPage } from './pages/CharacterPage';
import { ShopPage } from './pages/ShopPage';
import { WorkoutProvider } from './context/WorkoutContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextType, ThemeColors } from './types';

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false
);

  const colors: ThemeColors = useMemo(() => {
    if (darkMode) {
      return {
        primary: '#10B981',
        accent: '#059669',
        background: '#111827',
        card: '#1F2937',
        textPrimary: '#F9FAFB',
        textSecondary: '#D1D5DB',
        border: '#374151',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B'
      };
    }
    return {
      primary: '#10B981',
      accent: '#059669',
      background: '#F9FAFB',
      card: '#FFFFFF',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B'
    };
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, colors }}>
      <AuthProvider>
        <WorkoutProvider>
          <HashRouter>
            <div 
              className="min-h-screen pb-24 transition-colors duration-300"
              style={{ backgroundColor: colors.background, color: colors.textPrimary }}
            >
              <main className="max-w-md mx-auto px-4 pt-8">
                <Routes>
                  <Route path="/" element={<TodayPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/social" element={<SocialPage />} />
                  <Route path="/character" element={<CharacterPage />} />
                  <Route path="/shop" element={<ShopPage />} />
                </Routes>
              </main>

              {/* Bottom Navigation */}
              <nav 
                className="fixed bottom-0 left-0 right-0 border-t z-50 transition-colors duration-300 shadow-2xl"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <div className="max-w-md mx-auto flex justify-around items-center h-20">
                  <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-[9px] font-bold uppercase">Treino</span>
                  </NavLink>

                  <NavLink to="/social" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <span className="text-[9px] font-bold uppercase">Social</span>
                  </NavLink>

                  <NavLink to="/shop" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <span className="text-[9px] font-bold uppercase">Loja</span>
                  </NavLink>

                  <NavLink to="/character" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[9px] font-bold uppercase">Avatar</span>
                  </NavLink>

                  <button onClick={toggleDarkMode} className="p-2 text-gray-400 hover:text-emerald-500">
                    {darkMode ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M14.482 14.482a4.5 4.5 0 11-6.364-6.364 4.5 4.5 0 016.364 6.364z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                  </button>
                </div>
              </nav>
            </div>
          </HashRouter>
        </WorkoutProvider>
      </AuthProvider>
    </ThemeContext.Provider>
  );
};

export default App;
