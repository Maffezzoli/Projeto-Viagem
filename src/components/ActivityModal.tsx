import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, FileText, Utensils, Compass, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FileUpload } from './FileUpload';
import { motion } from 'framer-motion';

interface Activity {
  id?: string;
  trip_id: string;
  activity_date: string;
  time_range: string | null;
  description: string;
  maps_url: string | null;
  file_url?: string | null;
  activity_type?: 'itinerary' | 'restaurant' | 'tour';
  parent_id?: string | null;
}

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tripId: string;
  activityDate: string;
  activity?: Activity;
  isReadOnly?: boolean;
  parentId?: string | null;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tripId,
  activityDate,
  activity,
  isReadOnly = false,
  parentId = null,
}) => {
  const [description, setDescription] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [activityType, setActivityType] = useState<'itinerary' | 'restaurant' | 'tour'>('itinerary');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activity) {
      setDescription(activity.description || '');
      setTimeRange(activity.time_range || '');
      setMapsUrl(activity.maps_url || '');
      setActivityType(activity.activity_type || 'itinerary');
      setFileUrl(activity.file_url || null);
    } else {
      setDescription('');
      setTimeRange('');
      setMapsUrl('');
      setActivityType(parentId ? 'tour' : 'itinerary');
      setFileUrl(null);
    }
  }, [activity, isOpen, parentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    setIsLoading(true);
    setError('');

    const activityData = {
      trip_id: tripId,
      activity_date: activityDate,
      description,
      time_range: timeRange || null,
      maps_url: mapsUrl || null,
      activity_type: activityType,
      file_url: fileUrl,
      parent_id: activity?.id ? activity.parent_id : parentId,
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
    if (isReadOnly || !activity?.id || !confirm('Deseja excluir esta atividade?')) return;
    setIsLoading(true);
    const { error } = await supabase.from('daily_activities').delete().eq('id', activity.id);
    if (!error) { onSuccess(); onClose(); }
    setIsLoading(false);
  };

  const types = [
    { id: 'itinerary', label: 'Roteiro', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 'restaurant', label: 'Restaurante', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
    { id: 'tour', label: 'Passeio', icon: Compass, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
  ];

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
              {isReadOnly ? 'Detalhes' : (activity ? 'Editar' : (parentId ? 'Nova Sugestão' : 'Novo Bloco'))}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Planejamento Diário</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {!isReadOnly && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 text-center block">Tipo de Atividade</label>
              <div className="grid grid-cols-3 gap-3">
                {types.map((t) => {
                  const Icon = t.icon;
                  const isActive = activityType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActivityType(t.id as any)}
                      className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all gap-2 cursor-pointer ${isActive ? `border-blue-500 ${t.bg} ${t.color} shadow-lg shadow-blue-500/10` : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400'}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Descrição</label>
            <textarea
              required
              disabled={isReadOnly}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Almoço no Restaurante X ou Visita ao Ponto Y"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none font-medium disabled:opacity-70"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Horário</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  placeholder="Ex: 12:30"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs disabled:opacity-70"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Maps</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  disabled={isReadOnly}
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Anexo</label>
            {isReadOnly ? (
              fileUrl ? (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl group transition-all hover:bg-blue-100">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Abrir Anexo</span>
                </a>
              ) : <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Sem anexo</p>
            ) : (
              <FileUpload bucket="travel-assets" filePath={`trip-${tripId}-act-${activity?.id || 'new'}`} currentFileUrl={fileUrl} onUploadSuccess={setFileUrl} onRemove={() => setFileUrl(null)} />
            )}
          </div>

          {error && <p className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>}

          {!isReadOnly && (
            <div className="flex flex-col gap-3 pt-4">
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 dark:shadow-none uppercase tracking-widest text-[10px] cursor-pointer">
                {isLoading ? 'Salvando...' : 'Confirmar'}
              </button>
              {activity?.id && (
                <button type="button" onClick={handleDelete} className="w-full bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] cursor-pointer">
                  Remover
                </button>
              )}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};
