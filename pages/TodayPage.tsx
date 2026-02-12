
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { WorkoutStatus } from '../types';
import { ThemeContext } from '../App';
import { GoogleGenAI } from "@google/genai";
import { PixelAvatar } from './CharacterPage';

export const TodayPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const { user, addXP, openLogin, showLoginModal, performLogin, closeLogin } = useAuth();
  const { getWorkoutByDate, saveWorkout } = useWorkouts();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const currentWorkout = getWorkoutByDate(todayStr);

  const [flexoes, setFlexoes] = useState(false);
  const [abdominais, setAbdominais] = useState(false);
  const [agachamentos, setAgachamentos] = useState(false);
  const [km, setKm] = useState(0);
  const [isDoubled, setIsDoubled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // GPS Refs
  const watchId = useRef<number | null>(null);
  const lastPos = useRef<GeolocationCoordinates | null>(null);

  useEffect(() => {
    if (currentWorkout) {
      setFlexoes(currentWorkout.flexoes);
      setAbdominais(currentWorkout.abdominais);
      setAgachamentos(currentWorkout.agachamentos);
      setKm(currentWorkout.km || 0);
      setIsDoubled(!!currentWorkout.isDoubled);
    }
  }, [currentWorkout]);

  // Real GPS Tracking Logic
  useEffect(() => {
    if (isRunning) {
      if ("geolocation" in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const currentCoords = position.coords;
            if (lastPos.current) {
              const distanceKm = calculateDistance(
                lastPos.current.latitude,
                lastPos.current.longitude,
                currentCoords.latitude,
                currentCoords.longitude
              );
              if (distanceKm > 0.003) {
                  setKm(prev => {
                    const newKm = prev + distanceKm;
                    const target = isDoubled ? 20 : 10;
                    if (newKm >= target) {
                        setIsRunning(false); 
                        alert("Meta de distância atingida!");
                    }
                    return newKm;
                  });
                  lastPos.current = currentCoords;
              }
            } else {
                lastPos.current = currentCoords; // First fix
            }
          },
          (err) => {
              console.error("GPS Error:", err);
              setGpsError("Sinal de GPS fraco ou permissão negada.");
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
        );
      } else {
        setGpsError("Seu dispositivo não suporta GPS.");
      }
    } else {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      lastPos.current = null;
    }
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [isRunning, isDoubled]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI/180);

  const handleCreateMapsRoute = async () => {
    if (!user) {
        alert("Faça login para criar rotas.");
        openLogin();
        return;
    }

    setLoadingRoute(true);
    
    if (!navigator.geolocation) {
        alert("Seu dispositivo não suporta geolocalização.");
        setLoadingRoute(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `I am at Latitude: ${lat}, Longitude: ${lng}. I need a 10km running route loop. Return ONLY a JSON array of 3 waypoints {lat, lng}.`;

            let waypoints = [];
            try {
                const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
                const text = response.text.replace(/```json|```/g, '').trim();
                waypoints = JSON.parse(text);
            } catch (e) {
                waypoints = [{ lat: lat + 0.02, lng: lng }, { lat: lat + 0.02, lng: lng + 0.02 }, { lat: lat, lng: lng + 0.02 }];
            }

            const origin = `${lat},${lng}`;
            const waypointStr = waypoints.map((wp: any) => `${wp.lat},${wp.lng}`).join('|');
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${origin}&waypoints=${waypointStr}&travelmode=walking`;
            
            window.location.href = mapsUrl;

        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o serviço de mapas.");
        } finally {
            setLoadingRoute(false);
        }
    }, (err) => {
        alert("Permissão de localização necessária.");
        setLoadingRoute(false);
    });
  };

  const handleToggleDouble = () => {
    if (isDoubled) return; 
    setIsDoubled(true);
    saveWorkout({ date: todayStr, isDoubled: true });
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 300]);
  };

  const handleGiveUp = (e: React.MouseEvent) => {
    // Critical fix: Ensure immediate state update and prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Voltar para o treino normal (100 repetições)?")) {
      setIsDoubled(false); // Immediate local state update
      saveWorkout({ date: todayStr, isDoubled: false }); // Persist
    }
  };

  const handleMarkDone = () => {
    if (currentWorkout?.status === WorkoutStatus.FEITO) {
      alert("Treino já concluído!");
      return;
    }
    const target = isDoubled ? 20 : 10;
    if (km < target * 0.9) { 
       if (!window.confirm(`Você correu apenas ${km.toFixed(2)}km de ${target}km. Concluir mesmo assim?`)) return;
    }
    saveWorkout({ date: todayStr, flexoes, abdominais, agachamentos, km, isDoubled, status: WorkoutStatus.FEITO });
    addXP(isDoubled ? 20 : 10);
  };

  if (!theme) return null;
  const { colors } = theme;
  const targetKm = isDoubled ? 20 : 10;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Login Modal */}
      {showLoginModal && <GoogleLoginModal onClose={closeLogin} onLogin={performLogin} />}

      <header className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-black" style={{ color: colors.textPrimary }}>
             {user ? `Olá, ${user.name.split(' ')[0]}` : 'Bem-vindo, Herói'}
          </h1>
          {!user && (
              <button onClick={openLogin} className="text-emerald-500 font-bold text-sm underline mt-1">
                Fazer Login com Google
              </button>
          )}
          <p className="text-xs opacity-60 mt-1" style={{ color: colors.textSecondary }}>GPS Ativo: {isRunning ? 'Sim' : 'Pausado'}</p>
        </div>
        
        {user && (
            <div className="flex flex-col items-end gap-2">
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black shadow-sm">💰 {user.coins}</div>
                <div className="w-14 h-14 rounded-full border-2 border-emerald-500 overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center">
                   <PixelAvatar id={user.currentAvatarId} size={40} />
                </div>
            </div>
        )}
      </header>

      {/* Limit Break Control */}
      {!isDoubled ? (
          <button 
            onClick={handleToggleDouble}
            className="w-full bg-gradient-to-r from-gray-800 to-black text-white p-4 rounded-2xl font-black text-lg shadow-lg border-2 border-gray-700 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 group"
          >
            <span>ATIVAR LIMIT BREAK</span>
            <span className="text-xs bg-red-600 px-2 py-0.5 rounded text-white group-hover:animate-pulse">2X XP</span>
          </button>
      ) : (
          <div className="relative bg-red-600 text-white p-4 rounded-2xl shadow-lg border-2 border-yellow-400 overflow-hidden isolate">
             {/* Glow Effect */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/30 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl -z-10 pointer-events-none"></div>
             
             <div className="flex justify-between items-center relative z-20">
                  <div className="flex flex-col">
                      <span className="font-black text-sm uppercase italic tracking-wider animate-pulse">🔥 LIMIT BREAK ATIVO</span>
                      <span className="text-[10px] text-red-100 opacity-90">Recompensa dobrada ativada</span>
                  </div>
                  
                  {/* Desistir Button: High Z-Index, Explicit Pointer Events */}
                  <button 
                    onClick={handleGiveUp} 
                    className="bg-white hover:bg-red-50 text-red-600 active:scale-95 text-xs px-4 py-2 rounded-xl font-black uppercase shadow-sm transition-all z-50 cursor-pointer pointer-events-auto"
                  >
                    Desistir
                  </button>
             </div>
          </div>
      )}

      {/* Maps Route Button */}
      <button 
        onClick={handleCreateMapsRoute}
        disabled={loadingRoute}
        className="w-full bg-blue-500/10 text-blue-600 border border-blue-500/30 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all active:scale-95"
      >
        {loadingRoute ? (
             <span className="animate-pulse">Gerando rota com IA...</span>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" /></svg>
                Criar Rota 10km no Google Maps
            </>
        )}
      </button>

      <section className="flex flex-col gap-3">
        <ExerciseRow title={`${isDoubled ? '200' : '100'} Flexões`} checked={flexoes} onChange={() => setFlexoes(!flexoes)} colors={colors} />
        <ExerciseRow title={`${isDoubled ? '200' : '100'} Abdominais`} checked={abdominais} onChange={() => setAbdominais(!abdominais)} colors={colors} />
        <ExerciseRow title={`${isDoubled ? '200' : '100'} Agachamentos`} checked={agachamentos} onChange={() => setAgachamentos(!agachamentos)} colors={colors} />
      </section>

      <section className={`p-6 rounded-3xl shadow-xl border-4 transition-all ${isRunning ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white'}`} style={{ borderColor: isDoubled ? '#f97316' : (isRunning ? '#10B981' : colors.border) }}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-gray-800">Corrida GPS</h2>
            {isRunning && <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>}
        </div>
        
        {gpsError && <p className="text-xs text-red-500 text-center mb-2 font-bold">{gpsError}</p>}

        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl font-black text-emerald-600 tracking-tighter">
            {km.toFixed(2)}<span className="text-lg text-gray-400 ml-1">km</span>
          </div>
          <p className="text-xs font-bold uppercase text-gray-400">Meta: {targetKm} km</p>
          
          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button 
                onClick={() => setIsRunning(!isRunning)} 
                className={`py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 ${isRunning ? 'bg-orange-500' : 'bg-emerald-600'}`}
            >
              {isRunning ? 'PAUSAR' : 'INICIAR'}
            </button>
            <button 
                onClick={() => {
                    if(window.confirm("Zerar contador?")) setKm(0);
                }} 
                className="py-4 rounded-2xl font-bold bg-gray-200 text-gray-600 active:scale-95"
            >
              ZERAR
            </button>
          </div>
        </div>
      </section>

      <button onClick={handleMarkDone} className={`w-full py-5 rounded-3xl font-black text-lg shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-white ${isDoubled ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-emerald-600'}`}>
        {isDoubled ? 'FINALIZAR DESAFIO DEUS' : 'MARCAR COMO FEITO'}
      </button>
    </div>
  );
};

const ExerciseRow: React.FC<{ 
    title: string; 
    checked: boolean; 
    onChange: () => void; 
    colors: any 
}> = ({ title, checked, onChange, colors }) => (
    <button 
      onClick={onChange}
      className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${checked ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-transparent shadow-sm'}`}
    >
        <span className={`font-bold text-lg ${checked ? 'text-emerald-700 line-through opacity-50' : 'text-gray-700'}`}>{title}</span>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
            {checked && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </div>
    </button>
);

// Realistic Google Login Modal Simulation (Kept as requested)
const GoogleLoginModal: React.FC<{ onClose: () => void, onLogin: (email: string, name: string, photo: string) => void }> = ({ onClose, onLogin }) => {
    const [step, setStep] = useState(0); 

    useEffect(() => {
        const t = setTimeout(() => setStep(1), 800);
        return () => clearTimeout(t);
    }, []);

    const mockAccounts = [
        { email: "guerreiro.z@gmail.com", name: "Guerreiro Z", photo: "https://i.pravatar.cc/150?u=1" },
        { email: "one.punch.fan@gmail.com", name: "Saitama Fan", photo: "https://i.pravatar.cc/150?u=2" },
        { email: "ninja.way@gmail.com", name: "Ninja Way", photo: "https://i.pravatar.cc/150?u=3" }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden animate-slideUp">
                {step === 0 ? (
                     <div className="h-60 flex flex-col items-center justify-center gap-4">
                         <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                         <p className="text-sm font-medium text-gray-500">Conectando ao Google...</p>
                     </div>
                ) : (
                    <div className="p-6">
                        <div className="flex flex-col items-center mb-6">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-6 mb-2" alt="Google" />
                            <h3 className="text-lg font-medium text-gray-800">Escolha uma conta</h3>
                            <p className="text-sm text-gray-500">para prosseguir para o Saitama Tracker</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            {mockAccounts.map(acc => (
                                <button 
                                    key={acc.email}
                                    onClick={() => onLogin(acc.email, acc.name, acc.photo)}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md border-b border-gray-100 last:border-0 text-left transition-colors"
                                >
                                    <img src={acc.photo} className="w-8 h-8 rounded-full" alt="Profile" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                                        <p className="text-xs text-gray-500">{acc.email}</p>
                                    </div>
                                </button>
                            ))}
                            <button className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-md text-left transition-colors mt-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <p className="text-sm font-medium text-gray-900">Usar outra conta</p>
                            </button>
                        </div>
                        <div className="mt-6 pt-4 border-t text-[10px] text-center text-gray-400">
                            Ao continuar, o Google compartilhará seu nome, endereço de e-mail e foto do perfil com o Saitama Tracker.
                        </div>
                        <button onClick={onClose} className="mt-4 w-full py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded">Cancelar</button>
                    </div>
                )}
            </div>
        </div>
    );
};
