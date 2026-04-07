import React, { useState, useEffect } from 'react';
import { X, Tag, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PlaceSelector } from './PlaceSelector';
import { FileUpload } from './FileUpload';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trip: {
    id: string;
    destination: string;
    nickname?: string | null;
    start_date: string;
    end_date: string;
    people_count: number;
    location_image_url?: string | null;
  };
}

export const EditTripModal: React.FC<EditTripModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  trip,
}) => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(trip.destination);
  const [nickname, setNickname] = useState(trip.nickname || '');
  const [startDate, setStartDate] = useState(trip.start_date);
  const [endDate, setEndDate] = useState(trip.end_date);
  const [peopleCount, setPeopleCount] = useState(trip.people_count);
  const [imageUrl, setImageUrl] = useState(trip.location_image_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setDestination(trip.destination);
    setNickname(trip.nickname || '');
    setStartDate(trip.start_date);
    setEndDate(trip.end_date);
    setPeopleCount(trip.people_count);
    setImageUrl(trip.location_image_url || '');
    setShowDeleteConfirm(false);
  }, [trip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: supabaseError } = await supabase
      .from('trips')
      .update({
        destination,
        nickname: nickname || null,
        start_date: startDate,
        end_date: endDate,
        people_count: peopleCount,
        location_image_url: imageUrl,
      })
      .eq('id', trip.id);

    if (supabaseError) {
      setError('Erro ao atualizar viagem.');
    } else {
      onSuccess();
      onClose();
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const { error } = await supabase.from('trips').delete().eq('id', trip.id);
    if (!error) { onClose(); navigate('/dashboard'); }
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
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Configurações</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gerenciar Roteiro</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {!showDeleteConfirm ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Destino Oficial</label>
                <PlaceSelector value={destination} onChange={setDestination} />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Apelido da Viagem</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ex: Lua de Mel em Bali"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ida</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Volta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Capa da Viagem</label>
                <FileUpload
                  bucket="travel-assets"
                  filePath={`trip-${trip.id}-cover`}
                  currentFileUrl={imageUrl}
                  onUploadSuccess={setImageUrl}
                  onRemove={() => setImageUrl('')}
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>}

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 dark:shadow-none uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  {isLoading ? 'Salvando...' : 'Atualizar Dados'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  Excluir Roteiro
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-red-50 dark:bg-red-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Você tem certeza?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-8">
                  Isso excluirá permanentemente este roteiro e todos os seus anexos.
                </p>
              </div>
              <div className="flex flex-col gap-3 px-4">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-200 dark:shadow-none uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  {isLoading ? 'Excluindo...' : 'Sim, Excluir Definitivamente'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
