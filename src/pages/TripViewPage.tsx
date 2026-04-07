import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SnippetBlock } from '../components/SnippetBlock';
import { DailyPlan } from '../components/DailyPlan';
import { EditTripModal } from '../components/EditTripModal';
import { supabase } from '../lib/supabase';
import { exportTripToPDF } from '../lib/export';
import { ChevronLeft, Hotel, Ticket, Calendar as CalendarIcon, Users, Settings, Download, Loader2, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface TripDetails {
  trip_id: string;
  accommodation_snippet: string;
  transport_snippet: string;
  accommodation_file_url: string | null;
  transport_file_url: string | null;
}

interface Activity {
  id: string;
  trip_id: string;
  activity_date: string;
  time_range: string | null;
  description: string;
  maps_url: string | null;
  file_url?: string | null;
}

interface Trip {
  id: string;
  destination: string;
  nickname?: string | null;
  start_date: string;
  end_date: string;
  people_count: number;
  location_image_url?: string | null;
}

export const TripViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [details, setDetails] = useState<TripDetails | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const fetchTripData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { data: tripData, error: tripError } = await supabase.from('trips').select('*').eq('id', id).single();
      if (tripError) { if (!silent) navigate('/dashboard'); return; }
      setTrip(tripData);
      const { data: detailsData } = await supabase.from('trip_details').select('*').eq('trip_id', id).single();
      setDetails(detailsData);
      const { data: activitiesData } = await supabase.from('daily_activities').select('*').eq('trip_id', id).order('activity_date', { ascending: true }).order('time_range', { ascending: true, nullsFirst: true });
      setActivities(activitiesData || []);
    } catch (err) { console.error(err); } finally { if (!silent) setIsLoading(false); }
  };

  useEffect(() => { if (id) fetchTripData(); }, [id]);

  const handleExport = async () => {
    if (!trip || !details) return;
    setIsExporting(true);
    await exportTripToPDF({ trip, details, activities });
    setIsExporting(false);
  };

  const handleSaveSnippet = async (field: 'accommodation_snippet' | 'transport_snippet', newValue: string) => {
    if (!id) return;
    await supabase.from('trip_details').update({ [field]: newValue }).eq('trip_id', id);
    setDetails(prev => prev ? { ...prev, [field]: newValue } : null);
  };

  const handleSaveFile = async (field: 'accommodation_file_url' | 'transport_file_url', url: string) => {
    if (!id) return;
    await supabase.from('trip_details').update({ [field]: url }).eq('trip_id', id);
    setDetails(prev => prev ? { ...prev, [field]: url } : null);
  };

  const handleRemoveFile = async (field: 'accommodation_file_url' | 'transport_file_url') => {
    if (!id) return;
    await supabase.from('trip_details').update({ [field]: null }).eq('trip_id', id);
    setDetails(prev => prev ? { ...prev, [field]: null } : null);
  };

  if (isLoading || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        <div className="animate-pulse space-y-8">
          <div className="h-[50vh] bg-slate-200 dark:bg-slate-900"></div>
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-slate-200 dark:bg-slate-900 rounded-[2rem]"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-900 rounded-[2rem]"></div>
          </div>
        </div>
      </div>
    );
  }

  const heroImage = trip.location_image_url || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop`;
  const displayTitle = trip.nickname || trip.destination.split(',')[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20"
    >
      <div className="absolute top-0 left-0 right-0 z-20">
        <Header transparent absolute />
      </div>
      
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroImage} 
          alt={trip.destination} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/20 to-slate-50 dark:to-slate-950"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-6xl mx-auto w-full px-4 pb-12">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Link to="/dashboard" className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] group cursor-pointer">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Voltar ao Painel</span>
                  </Link>
                </motion.div>

                {/* Edit Mode Toggle */}
                <motion.button 
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  transition={{ delay: 0.2 }}
                  onClick={() => setIsReadOnly(!isReadOnly)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer ${isReadOnly ? 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20' : 'bg-blue-600 border-blue-500 text-white shadow-lg'}`}
                >
                  {isReadOnly ? <><Lock className="w-3 h-3" /><span>Modo Leitura</span></> : <><Unlock className="w-3 h-3" /><span>Modo Edição</span></>}
                </motion.button>
              </div>
              
              <div className="space-y-2 text-center md:text-left">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">Roteiro Oficial</motion.div>
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none drop-shadow-sm">{displayTitle}</motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-slate-600 dark:text-slate-400 font-bold text-lg ml-1 uppercase tracking-widest opacity-80 italic">{trip.destination}</motion.p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center space-x-3 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/50 dark:border-slate-700 shadow-xl shadow-slate-900/5">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-black text-sm uppercase tracking-tight">
                    {format(new Date(trip.start_date + 'T00:00:00'), "dd MMM", { locale: ptBR })} — {format(new Date(trip.end_date + 'T00:00:00'), "dd MMM yyyy", { locale: ptBR })}
                  </span>
                </motion.div>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center space-x-3 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/50 dark:border-slate-700 shadow-xl shadow-slate-900/5">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-black text-sm uppercase tracking-tight">{trip.people_count} {trip.people_count === 1 ? 'Viajante' : 'Viajantes'}</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-24 right-8 z-30 flex gap-3">
           <button 
             onClick={handleExport}
             disabled={isExporting}
             className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all shadow-xl cursor-pointer disabled:opacity-50"
             title="Exportar PDF"
           >
              {isExporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
           </button>
           {!isReadOnly && (
             <button 
               onClick={() => setIsEditModalOpen(true)} 
               className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all shadow-xl cursor-pointer"
               title="Configurações"
             >
                <Settings className="w-6 h-6" />
             </button>
           )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <SnippetBlock
            title="Hospedagem"
            icon={Hotel}
            isReadOnly={isReadOnly}
            value={details?.accommodation_snippet || ''}
            onSave={(val) => handleSaveSnippet('accommodation_snippet', val)}
            placeholder="Detalhes do hotel..."
            fileUrl={details?.accommodation_file_url}
            onFileSave={(url) => handleSaveFile('accommodation_file_url', url)}
            onFileRemove={() => handleRemoveFile('accommodation_file_url')}
            tripId={trip.id}
          />
          <SnippetBlock
            title="Passagens"
            icon={Ticket}
            isReadOnly={isReadOnly}
            value={details?.transport_snippet || ''}
            onSave={(val) => handleSaveSnippet('transport_snippet', val)}
            placeholder="Detalhes do transporte..."
            fileUrl={details?.transport_file_url}
            onFileSave={(url) => handleSaveFile('transport_file_url', url)}
            onFileRemove={() => handleRemoveFile('transport_file_url')}
            tripId={trip.id}
          />
        </motion.div>

        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, duration: 0.6 }} className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-transparent rounded-full hidden md:block opacity-20"></div>
          <DailyPlan
            tripId={trip.id}
            isReadOnly={isReadOnly}
            activities={activities}
            startDate={trip.start_date}
            endDate={trip.end_date}
            onUpdate={fetchTripData}
          />
        </motion.div>
      </main>

      <EditTripModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchTripData} trip={trip} />
    </motion.div>
  );
};
