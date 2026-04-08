import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SnippetBlock } from '../components/SnippetBlock';
import { DailyPlan } from '../components/DailyPlan';
import { EditTripModal } from '../components/EditTripModal';
import { ImportExportModal } from '../components/ImportExportModal';
import { supabase } from '../lib/supabase';
import { exportTripToPDF } from '../lib/export';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeft, Hotel, Ticket, Calendar as CalendarIcon, Users, Settings, Download, Loader2, Lock, Unlock, FileCode } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface TripDetails {
  trip_id: string;
  accommodation_snippet: string;
  transport_snippet: string;
  accommodation_name?: string;
  accommodation_checkin?: string;
  accommodation_checkout?: string;
  accommodation_address?: string;
  transport_type?: string;
  transport_company?: string;
  transport_departure_location?: string;
  transport_arrival_location?: string;
  transport_departure_time?: string;
  transport_arrival_time?: string;
  transport_return_company?: string;
  transport_return_departure_location?: string;
  transport_return_arrival_location?: string;
  transport_return_departure_time?: string;
  transport_return_arrival_time?: string;
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
  activity_type?: 'itinerary' | 'restaurant' | 'tour';
  parent_id?: string | null;
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
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [details, setDetails] = useState<TripDetails | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
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
    await exportTripToPDF({ trip, details, activities, theme });
    setIsExporting(false);
  };

  const handleSaveSnippet = async (updates: Partial<TripDetails>) => {
    if (!id) return;
    await supabase.from('trip_details').update(updates).eq('trip_id', id);
    setDetails(prev => prev ? { ...prev, ...updates } : null);
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <Header />
        <div className="animate-pulse space-y-8">
          <div className="h-[50vh] bg-slate-200 dark:bg-slate-900"></div>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-slate-200 dark:bg-slate-900 rounded-[2rem]"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-900 rounded-[2rem]"></div>
          </div>
        </div>
      </div>
    );
  }

  const heroImage = trip.location_image_url;
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
      
      <div className="relative h-[65vh] min-h-[450px] w-full overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          {heroImage && (
            <motion.img 
              key={heroImage}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              src={heroImage} 
              alt={trip.destination} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/20 to-slate-50 dark:to-slate-950"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-6xl mx-auto w-full px-6 pb-12">
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Link to="/dashboard" className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] group cursor-pointer bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Painel</span>
                  </Link>
                </motion.div>

                <div className="w-full sm:w-auto flex flex-wrap items-center justify-end gap-2">
                  <motion.button 
                    initial={{ y: 10, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.3 }}
                    onClick={() => setIsReadOnly(!isReadOnly)}
                    className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-full backdrop-blur-md border transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer ${isReadOnly ? 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20' : 'bg-blue-600 border-blue-500 text-white shadow-xl'}`}
                  >
                    {isReadOnly ? <><Lock className="w-3.5 h-3.5" /><span className="hidden sm:inline">Trava</span></> : <><Unlock className="w-3.5 h-3.5" /><span className="hidden sm:inline">Editar</span></>}
                  </motion.button>

                  <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/10">
                    <button 
                      onClick={handleExport}
                      disabled={isExporting}
                      className="p-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                      title="Exportar PDF"
                    >
                      {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    </button>

                    <button 
                      onClick={() => setIsImportExportOpen(true)}
                      className="p-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                      title="JSON / I.A"
                    >
                      <FileCode className="w-5 h-5" />
                    </button>

                    {!isReadOnly && (
                      <button 
                        onClick={() => setIsEditModalOpen(true)} 
                        className="p-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        title="Configurações"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-left">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">Roteiro Oficial</motion.div>
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none drop-shadow-sm">{displayTitle}</motion.h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-lg ml-1 uppercase tracking-widest opacity-80 italic">{trip.destination}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
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
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <SnippetBlock
            type="accommodation"
            title="Hospedagem"
            icon={Hotel}
            isReadOnly={isReadOnly}
            details={details}
            onSave={handleSaveSnippet}
            fileUrl={details?.accommodation_file_url}
            onFileSave={(url) => handleSaveFile('accommodation_file_url', url)}
            onFileRemove={() => handleRemoveFile('accommodation_file_url')}
            tripId={trip.id}
          />
          <SnippetBlock
            type="transport"
            title="Passagens"
            icon={Ticket}
            isReadOnly={isReadOnly}
            details={details}
            onSave={handleSaveSnippet}
            fileUrl={details?.transport_file_url}
            onFileSave={(url) => handleSaveFile('transport_file_url', url)}
            onFileRemove={() => handleRemoveFile('transport_file_url')}
            tripId={trip.id}
          />
        </div>

        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-transparent rounded-full hidden md:block opacity-20"></div>
          <DailyPlan
            tripId={trip.id}
            isReadOnly={isReadOnly}
            activities={activities}
            startDate={trip.start_date}
            endDate={trip.end_date}
            onUpdate={fetchTripData}
          />
        </div>
      </main>

      <EditTripModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchTripData} trip={trip} />
      
      {trip && details && (
        <ImportExportModal
          isOpen={isImportExportOpen}
          onClose={() => setIsImportExportOpen(false)}
          onSuccess={fetchTripData}
          trip={trip}
          details={details}
          activities={activities}
        />
      )}
    </motion.div>
  );
};
