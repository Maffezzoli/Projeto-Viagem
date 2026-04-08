import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { TripCard } from '../components/TripCard';
import { NewTripModal } from '../components/NewTripModal';
import { EditTripModal } from '../components/EditTripModal';
import { AppSettingsModal } from '../components/AppSettingsModal';
import { supabase } from '../lib/supabase';
import { Plus, Plane, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Trip {
  id: string;
  destination: string;
  nickname?: string | null;
  start_date: string;
  end_date: string;
  people_count: number;
  location_image_url?: string | null;
}

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop';

export const DashboardPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [heroImage, setHeroImage] = useState<string>(DEFAULT_HERO);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const { data: tripsData } = await supabase.from('trips').select('*').order('start_date', { ascending: true });
      if (tripsData) setTrips(tripsData);

      const { data: settingsData } = await supabase.from('app_settings').select('value').eq('key', 'dashboard_hero_image').single();
      if (settingsData?.value) {
        setHeroImage(settingsData.value);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTripClick = (id: string) => navigate(`/trip/${id}`);
  const handleEditClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const trip = trips.find(t => t.id === id);
    if (trip) setEditingTrip(trip);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors"
    >
      <Header transparent absolute onSettingsClick={() => setIsSettingsOpen(true)} />
      
      {/* Edge-to-Edge Dynamic Hero Section */}
      <div className="relative pt-40 pb-32 md:pt-32 overflow-hidden min-h-[550px] flex items-center bg-slate-950">
        <AnimatePresence mode="wait">
          {heroImage && (
            <motion.img 
              key={heroImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              src={heroImage} 
              alt="Dashboard Hero" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-50 dark:to-slate-950"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6 text-left">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-600/20 border border-blue-400/30 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explorar o Mundo</span>
              </motion.div>
              
              <div className="space-y-2">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-2xl"
                >
                  Minhas <br /><span className="text-blue-500">Aventuras.</span>
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/80 font-bold text-lg md:text-xl max-w-md leading-relaxed drop-shadow-md"
                >
                  Organize seus roteiros e lembranças em um só lugar.
                </motion.p>
              </div>
            </div>
            
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center justify-center space-x-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 px-12 rounded-[2.5rem] transition-all shadow-2xl shadow-blue-900/40 hover:scale-105 active:scale-95 cursor-pointer w-full md:w-auto"
            >
              <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
              <span className="uppercase tracking-[0.2em] text-[10px]">Novo Roteiro</span>
            </motion.button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-12 relative z-20 pb-24">
        {isLoading && trips.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm animate-pulse border border-slate-100 dark:border-slate-800"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
          >
            {trips.length > 0 ? (
              trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  {...trip}
                  onClick={handleTripClick}
                  onEdit={handleEditClick}
                />
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-12 md:p-24 text-center space-y-8 shadow-xl shadow-slate-200/50">
                <div className="bg-slate-50 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-700 shadow-inner">
                  <Plane className="text-slate-300 dark:text-slate-600 w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">O mundo espera</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Você ainda não criou nenhum roteiro de viagem.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-full transition-all shadow-lg cursor-pointer"
                >
                  Criar minha primeira viagem
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <NewTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
      {editingTrip && <EditTripModal isOpen={!!editingTrip} onClose={() => setEditingTrip(null)} onSuccess={fetchData} trip={editingTrip} />}
      <AppSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSuccess={fetchData} currentHeroImage={heroImage} />
    </motion.div>
  );
};
