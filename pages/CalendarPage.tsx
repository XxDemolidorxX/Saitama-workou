
import React, { useState, useContext } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { WorkoutStatus, WorkoutEntry } from '../types';
import { ThemeContext } from '../App';

export const CalendarPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { workouts, saveWorkout } = useWorkouts();
  
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutEntry | null>(null);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getStatusForDay = (day: number) => {
    const d = new Date(year, month, day);
    const dateStr = d.toISOString().split('T')[0];
    return workouts.find(w => w.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const workout = getStatusForDay(day);
    if (workout) {
      setSelectedWorkout(workout);
    } else {
      const d = new Date(year, month, day);
      setSelectedWorkout({
        id: 'new',
        date: d.toISOString().split('T')[0],
        flexoes: false,
        abdominais: false,
        agachamentos: false,
        km: 0,
        status: WorkoutStatus.NAO_DEFINIDO
      });
    }
  };

  const toggleStatus = () => {
    if (!selectedWorkout) return;
    const newStatus = selectedWorkout.status === WorkoutStatus.FEITO ? WorkoutStatus.NAO_FIZ : WorkoutStatus.FEITO;
    const updated = { ...selectedWorkout, status: newStatus };
    saveWorkout(updated);
    setSelectedWorkout(updated);
  };

  if (!theme) return null;
  const { colors } = theme;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Histórico</h1>
      </header>

      <section className="p-4 rounded-2xl border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <div className="flex items-center justify-between mb-6 px-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-bold capitalize" style={{ color: colors.textPrimary }}>{monthName}</h3>
          <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <div key={d} className="text-xs font-bold opacity-40 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {padding.map(i => <div key={`p-${i}`} className="aspect-square" />)}
          {days.map(day => {
            const workout = getStatusForDay(day);
            let bgClass = 'bg-transparent';
            let textColor = colors.textPrimary;
            
            if (workout?.status === WorkoutStatus.FEITO) {
              bgClass = 'bg-emerald-500';
              textColor = '#FFFFFF';
            } else if (workout?.status === WorkoutStatus.NAO_FIZ) {
              bgClass = 'bg-red-500';
              textColor = '#FFFFFF';
            }

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square flex items-center justify-center text-sm font-semibold rounded-lg transition-all active:scale-90 ${bgClass}`}
                style={{ color: textColor, border: workout ? 'none' : `1px solid ${colors.border}` }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center gap-6 text-xs font-medium px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span style={{ color: colors.textSecondary }}>Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span style={{ color: colors.textSecondary }}>Falhou</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border rounded-full" style={{ borderColor: colors.border }} />
          <span style={{ color: colors.textSecondary }}>Vazio</span>
        </div>
      </div>

      {selectedWorkout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl p-8 animate-slideUp shadow-2xl" style={{ backgroundColor: colors.card }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                Dia {new Date(selectedWorkout.date).getDate() + 1}
              </h2>
              <button onClick={() => setSelectedWorkout(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: colors.border }}>
                <span style={{ color: colors.textSecondary }}>Flexões</span>
                <StatusIcon done={selectedWorkout.flexoes} />
              </div>
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: colors.border }}>
                <span style={{ color: colors.textSecondary }}>Abdominais</span>
                <StatusIcon done={selectedWorkout.abdominais} />
              </div>
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: colors.border }}>
                <span style={{ color: colors.textSecondary }}>Agachamentos</span>
                <StatusIcon done={selectedWorkout.agachamentos} />
              </div>
              <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: colors.border }}>
                <span style={{ color: colors.textSecondary }}>Corrida</span>
                <span className="font-bold">{selectedWorkout.km.toFixed(2)} km</span>
              </div>
            </div>

            <button 
              onClick={toggleStatus}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform ${selectedWorkout.status === WorkoutStatus.FEITO ? 'bg-red-500' : 'bg-emerald-500'}`}
            >
              {selectedWorkout.status === WorkoutStatus.FEITO ? 'Marcar como Não Fiz' : 'Marcar como Concluído'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusIcon: React.FC<{ done: boolean }> = ({ done }) => (
  <div className={done ? "text-emerald-500" : "text-gray-300"}>
    {done ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
  </div>
);
