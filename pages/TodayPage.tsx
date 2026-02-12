
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { WorkoutStatus } from '../types';
import { ThemeContext } from '../App';
import { GoogleGenAI } from "@google/genai";

interface RouteSuggestion {
  title: string;
  uri: string;
}

export const TodayPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { user, addXP } = useAuth();
  const { getWorkoutByDate, saveWorkout } = useWorkouts();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const currentWorkout = getWorkoutByDate(todayStr);

  const [flexoes, setFlexoes] = useState(false);
  const [abdominais, setAbdominais] = useState(false);
  const [agachamentos, setAgachamentos] = useState(false);
  const [km, setKm] = useState(0);
  const [isDoubled, setIsDoubled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [suggestedRoutes, setSuggestedRoutes] = useState<RouteSuggestion[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    if (currentWorkout) {
      setFlexoes(currentWorkout.flexoes);
      setAbdominais(currentWorkout.abdominais);
      setAgachamentos(currentWorkout.agachamentos);
      setKm(currentWorkout.km);
      setIsDoubled(!!currentWorkout.isDoubled);
    }
  }, [currentWorkout]);

  useEffect(() => {
    let interval: any;
    const targetKm = isDoubled ? 20 : 10;
    if (isRunning && km < targetKm) {
      interval = setInterval(() => {
        setKm(prev => {
          const next = Math.min(prev + 0.05, targetKm);
          if (next >= targetKm) setIsRunning(false);
          return Math.round(next * 100) / 100;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, km, isDoubled]);

  const handleToggleDouble = () => {
    const nextState = !isDoubled;
    setIsDoubled(nextState);
    saveWorkout({ date: todayStr, isDoubled: nextState });
    if (nextState) {
        alert("DESPERTAR: LIMIT BREAK ATIVADO! Seus objetivos dobraram.");
    }
  };

  const handleMarkDone = () => {
    if (currentWorkout?.status === WorkoutStatus.FEITO) {
      alert("Treino já concluído hoje!");
      return;
    }
    saveWorkout({
      date: todayStr,
      flexoes,
      abdominais,
      agachamentos,
      km,
      isDoubled,
      status: WorkoutStatus.FEITO
    });
    
    const xpReward = isDoubled ? 20 : 10;
    addXP(xpReward); 
    alert(`Treino concluído! +${xpReward} XP ganhos.${isDoubled ? ' LIMIT BREAK!' : ''}`);
  };

  const handleMarkMissed = () => {
    saveWorkout({ date: todayStr, status: WorkoutStatus.NAO_FIZ });
    alert("Registrado como NÃO FEITO.");
  };

  if (!theme) return null;
  const { colors } = theme;

  const level = user ? Math.floor(user.xp / 10) : 0;
  const nextLevelXP = (level + 1) * 10;
  const currentLevelXP = level * 10;
  const progress = user ? ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 0;
  const targetKm = isDoubled ? 20 : 10;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Olá, {user ? user.name.split(' ')[0] : 'Herói'}</h1>
            <p className="text-sm opacity-70" style={{ color: colors.textSecondary }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
               <div className="flex flex-col items-end">
                 <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-1 rounded-full mb-1">
                    <span className="text-xs font-black text-yellow-600">💰 {user.coins}</span>
                 </div>
                 <div className="w-14 h-14 rounded-full border-2 border-emerald-500 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                   {user.character ? (
                     <div className="scale-150 mt-14"><SmallCharacterSVG config={user.character} /></div>
                   ) : (
                     <img src={user.photo} className="w-full h-full object-cover" alt="Profile" />
                   )}
                 </div>
               </div>
            </div>
          )}
        </div>

        {user && (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border shadow-sm" style={{ borderColor: colors.border }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase opacity-60">Nível {level}</span>
              <span className="text-[10px] font-black uppercase opacity-60">{user.xp} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </header>

      {isDoubled && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg animate-pulse">
           <span className="text-white font-black text-xs uppercase tracking-tighter italic">🔥 LIMIT BREAK ATIVADO: RECOMPENSA 2X XP 🔥</span>
        </div>
      )}

      {aiTip && !isDoubled && (
        <div className="p-4 rounded-2xl border italic text-sm text-center bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" style={{ color: colors.primary }}>
          "{aiTip}"
        </div>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Exercícios</h2>
            <span className="text-[10px] opacity-40 uppercase font-bold">Segure 7s para dobrar</span>
        </div>
        
        <ExerciseCard 
            title={`${isDoubled ? '200' : '100'} Flexões`} 
            checked={flexoes} 
            onChange={() => setFlexoes(!flexoes)} 
            onLongPress={handleToggleDouble}
            isDoubled={isDoubled}
            colors={colors} 
        />
        <ExerciseCard 
            title={`${isDoubled ? '200' : '100'} Abdominais`} 
            checked={abdominais} 
            onChange={() => setAbdominais(!abdominais)} 
            onLongPress={handleToggleDouble}
            isDoubled={isDoubled}
            colors={colors} 
        />
        <ExerciseCard 
            title={`${isDoubled ? '200' : '100'} Agachamentos`} 
            checked={agachamentos} 
            onChange={() => setAgachamentos(!agachamentos)} 
            onLongPress={handleToggleDouble}
            isDoubled={isDoubled}
            colors={colors} 
        />
      </section>

      <section 
        className={`p-6 rounded-3xl shadow-sm border transition-all ${isDoubled ? 'ring-2 ring-orange-500 border-orange-500 shadow-orange-500/20' : ''}`} 
        style={{ backgroundColor: colors.card, borderColor: isDoubled ? '#f97316' : colors.border }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>Corrida</h2>
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-black text-emerald-500 flex items-baseline gap-1">
            {km.toFixed(2)} 
            <span className="text-lg font-normal opacity-60">/ {targetKm}.00 km</span>
            {isDoubled && <span className="text-xs text-orange-500 animate-bounce ml-2">2X</span>}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(km / targetKm) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <LongPressButton 
              onLongPress={handleToggleDouble} 
              onClick={() => setIsRunning(!isRunning)}
              className={`py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${isRunning ? 'bg-orange-500' : 'bg-emerald-500'}`}
            >
              {isRunning ? 'Pausar' : 'Iniciar'}
            </LongPressButton>
            <button onClick={() => { setIsRunning(false); setKm(0); }} className="py-3 rounded-xl font-bold bg-gray-500 text-white active:scale-95">Zerar</button>
            <button onClick={() => setKm(targetKm)} className="py-3 rounded-xl font-bold bg-blue-500 text-white active:scale-95">Pular</button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 mt-4 mb-10">
        <button 
            onClick={handleMarkDone} 
            className={`w-full py-5 rounded-3xl font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-white ${isDoubled ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-orange-500/40' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
        >
          {isDoubled ? 'CONCLUIR DESAFIO DUPLO' : 'MARCAR COMO FEITO'}
        </button>
        <button onClick={handleMarkMissed} className="w-full py-4 rounded-3xl border border-red-500 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-[0.98] transition-all">Não fiz hoje</button>
      </div>
    </div>
  );
};

// Character component
const SmallCharacterSVG: React.FC<{ config: any }> = ({ config }) => {
  const { gender, skinTone, hairStyle, hairColor, underwearColor, equippedItems } = config;
  const underColor = underwearColor === 'black' ? '#1A1A1A' : '#F2F2F2';
  const isWearingTorso = !!equippedItems?.torso;
  const isWearingLegs = !!equippedItems?.legs;
  return (
    <svg width="100" height="100" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="45" r="22" fill={skinTone} />
      {gender === 'male' ? (
        <>
          <path d="M70 70 L130 70 L125 130 L75 130 Z" fill={skinTone} />
          <path d="M75 120 H125 L125 140 L100 155 L75 140 Z" fill={isWearingLegs ? "#FF9900" : underColor} />
        </>
      ) : (
        <>
          <path d="M75 70 L125 70 Q130 100 115 130 L85 130 Q70 100 75 70" fill={skinTone} />
          <path d="M75 80 Q100 85 125 80 L122 95 Q100 100 78 95 Z" fill={isWearingTorso ? "#FF66CC" : underColor} />
          <path d="M85 130 H115 L110 145 Q100 155 90 145 Z" fill={isWearingLegs ? "#FF66CC" : underColor} />
        </>
      )}
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

const ExerciseCard: React.FC<{ 
    title: string; 
    checked: boolean; 
    onChange: () => void; 
    onLongPress: () => void;
    isDoubled: boolean;
    colors: any 
}> = ({ title, checked, onChange, onLongPress, isDoubled, colors }) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  const HOLD_TIME = 7000;

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDoubled) return; // Only allow doubling once
    setHoldProgress(0);
    const start = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const p = Math.min((elapsed / HOLD_TIME) * 100, 100);
        setHoldProgress(p);
        if (p >= 100) {
            clearInterval(progressIntervalRef.current);
            onLongPress();
        }
    }, 50);

    timerRef.current = setTimeout(() => {
        clearInterval(progressIntervalRef.current);
    }, HOLD_TIME + 100);
  };

  const handleEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setHoldProgress(0);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <button 
        onClick={onChange} 
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        className={`w-full p-5 border flex items-center justify-between gap-4 transition-all relative z-10 ${checked ? 'border-emerald-500 bg-emerald-500/10' : ''} ${isDoubled ? 'ring-2 ring-orange-500/30' : ''}`} 
        style={{ backgroundColor: colors.card, borderColor: isDoubled ? '#f97316' : (checked ? colors.primary : colors.border) }}
      >
        <div className="flex items-center gap-4">
          <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${checked ? 'bg-emerald-500 border-emerald-500 shadow-sm' : 'border-gray-300'}`}>
              {checked && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
          </div>
          <span className={`text-lg font-bold ${checked ? 'opacity-30 line-through' : ''}`} style={{ color: colors.textPrimary }}>{title}</span>
        </div>
        {isDoubled && (
          <div className="bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">2X</div>
        )}
      </button>
      {/* Visual Hold Progress Bar */}
      {holdProgress > 0 && holdProgress < 100 && (
          <div 
            className="absolute bottom-0 left-0 h-1.5 bg-orange-500 transition-all z-20" 
            style={{ width: `${holdProgress}%` }}
          />
      )}
    </div>
  );
};

const LongPressButton: React.FC<{ 
    children: React.ReactNode; 
    onLongPress: () => void; 
    onClick: () => void;
    className?: string;
}> = ({ children, onLongPress, onClick, className }) => {
    const [holdProgress, setHoldProgress] = useState(0);
    const timerRef = useRef<any>(null);
    const progressIntervalRef = useRef<any>(null);
    const HOLD_TIME = 7000;

    const handleStart = () => {
        setHoldProgress(0);
        const start = Date.now();
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const p = Math.min((elapsed / HOLD_TIME) * 100, 100);
            setHoldProgress(p);
            if (p >= 100) {
                clearInterval(progressIntervalRef.current);
                onLongPress();
            }
        }, 50);

        timerRef.current = setTimeout(() => {
            clearInterval(progressIntervalRef.current);
        }, HOLD_TIME + 100);
    };

    const handleEnd = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setHoldProgress(0);
    };

    return (
        <div className="relative rounded-xl overflow-hidden flex-1">
            <button 
                onClick={onClick}
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                className={`w-full h-full ${className}`}
            >
                {children}
            </button>
            {holdProgress > 0 && holdProgress < 100 && (
                <div 
                    className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all" 
                    style={{ width: `${holdProgress}%` }}
                />
            )}
        </div>
    );
};
