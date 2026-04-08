import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PlaceSelector } from './PlaceSelector';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const keyword = destination.split(',')[0].trim().toLowerCase();
    const reliableUrl = `https://loremflickr.com/1920/1080/${encodeURIComponent(keyword)},travel,city?lock=${Math.floor(Math.random() * 1000)}`;

    const { error: supabaseError } = await supabase.from('trips').insert([
      {
        destination,
        start_date: startDate,
        end_date: endDate,
        people_count: peopleCount,
        location_image_url: reliableUrl,
      },
    ]);

    if (!supabaseError) {
      onSuccess();
      onClose();
      setDestination('');
      setStartDate('');
      setEndDate('');
      setPeopleCount(1);
    } else {
      setError('Erro ao criar viagem.');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nova Viagem</h2>
            <p className="text-sm text-slate-500 font-medium">Inicie seu próximo roteiro.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destino</label>
            <PlaceSelector value={destination} onChange={setDestination} placeholder="Ex: Tóquio, Japão" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ida</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Volta</label>
              <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Viajantes</label>
            <input type="number" min="1" required value={peopleCount} onChange={(e) => setPeopleCount(parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>

          {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg dark:shadow-none uppercase tracking-widest text-[10px] cursor-pointer mt-4">
            {isLoading ? 'Criando...' : 'Confirmar Viagem'}
          </button>
        </form>
      </div>
    </div>
  );
};
