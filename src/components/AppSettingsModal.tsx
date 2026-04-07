import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FileUpload } from './FileUpload';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentHeroImage: string;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentHeroImage,
}) => {
  const [heroImage, setHeroImage] = useState(currentHeroImage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setHeroImage(currentHeroImage);
  }, [currentHeroImage, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: supabaseError } = await supabase
      .from('app_settings')
      .upsert({ key: 'dashboard_hero_image', value: heroImage });

    if (supabaseError) {
      setError('Erro ao salvar configurações.');
      console.error(supabaseError);
    } else {
      onSuccess();
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-8 border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Configurações</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Personalizar Dashboard</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Imagem de Fundo (Dashboard)
            </label>
            <FileUpload
              bucket="travel-assets"
              filePath="global-dashboard-hero"
              currentFileUrl={heroImage}
              onUploadSuccess={setHeroImage}
              onRemove={() => setHeroImage('')}
              label="Trocar imagem principal"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-[10px] mt-4"
          >
            {isLoading ? 'Salvando...' : 'Aplicar Mudanças'}
          </button>
        </form>
      </div>
    </div>
  );
};
