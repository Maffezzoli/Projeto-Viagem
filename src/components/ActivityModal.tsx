import React, { useState, useEffect } from 'react';
import { X, Clock, AlignLeft, MapPin, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FileUpload } from './FileUpload';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id?: string;
  trip_id: string;
  activity_date: string;
  time_range: string | null;
  description: string;
  maps_url: string | null;
  file_url?: string | null;
}

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tripId: string;
  activityDate: string;
  activity?: Activity;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tripId,
  activityDate,
  activity,
}) => {
  const [description, setDescription] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activity) {
      setDescription(activity.description || '');
      setTimeRange(activity.time_range || '');
      setMapsUrl(activity.maps_url || '');
      setFileUrl(activity.file_url || null);
    } else {
      setDescription('');
      setTimeRange('');
      setMapsUrl('');
      setFileUrl(null);
    }
  }, [activity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const activityData = {
      trip_id: tripId,
      activity_date: activityDate,
      description,
      time_range: timeRange || null,
      maps_url: mapsUrl || null,
      file_url: fileUrl,
    };

    let supabaseError;
    if (activity?.id) {
      const { error } = await supabase.from('daily_activities').update(activityData).eq('id', activity.id);
      supabaseError = error;
    } else {
      const { error } = await supabase.from('daily_activities').insert([activityData]);
      supabaseError = error;
    }

    if (supabaseError) {
      setError('Erro ao salvar atividade.');
    } else {
      onSuccess();
      onClose();
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!activity?.id || !confirm('Deseja excluir esta atividade?')) return;
    setIsLoading(true);
    const { error } = await supabase.from('daily_activities').delete().eq('id', activity.id);
    if (!error) { onSuccess(); onClose(); }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
      >
        <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {activity ? 'Editar Atividade' : 'Nova Atividade'}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Planejamento Diário</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">O que vamos fazer?</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Visita ao Museu do Louvre (Markdown suportado)"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Horário</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  placeholder="Ex: 10:00 - 12:00"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Link do Maps</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Anexo (Opcional)</label>
            <FileUpload
              bucket="travel-assets"
              filePath={`trip-${tripId}-act-${activity?.id || 'new'}`}
              currentFileUrl={fileUrl}
              onUploadSuccess={setFileUrl}
              onRemove={() => setFileUrl(null)}
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>}

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 dark:shadow-none uppercase tracking-widest text-[10px] cursor-pointer"
            >
              {isLoading ? 'Salvando...' : 'Confirmar Atividade'}
            </button>
            {activity?.id && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] cursor-pointer"
              >
                Remover Atividade
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
