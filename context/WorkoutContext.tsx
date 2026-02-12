
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WorkoutEntry, WorkoutStatus } from '../types';

interface WorkoutContextType {
  workouts: WorkoutEntry[];
  getWorkoutByDate: (date: string) => WorkoutEntry | undefined;
  saveWorkout: (entry: Partial<WorkoutEntry> & { date: string }) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('saitama_workouts');
    if (saved) {
      try {
        setWorkouts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved workouts", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('saitama_workouts', JSON.stringify(workouts));
  }, [workouts]);

  const getWorkoutByDate = useCallback((date: string) => {
    return workouts.find(w => w.date === date);
  }, [workouts]);

  const saveWorkout = useCallback((entry: Partial<WorkoutEntry> & { date: string }) => {
    setWorkouts(prev => {
      const existingIndex = prev.findIndex(w => w.date === entry.date);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...entry };
        return updated;
      }
      const newEntry: WorkoutEntry = {
        id: crypto.randomUUID(),
        flexoes: false,
        abdominais: false,
        agachamentos: false,
        km: 0,
        status: WorkoutStatus.NAO_DEFINIDO,
        isDoubled: false,
        ...entry
      };
      return [...prev, newEntry];
    });
  }, []);

  return (
    <WorkoutContext.Provider value={{ workouts, getWorkoutByDate, saveWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error("useWorkouts must be used within a WorkoutProvider");
  return context;
};
