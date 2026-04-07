import React, { useState, useRef } from 'react';
import { X, Loader2, FileText, Link as LinkIcon, Upload, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FileUploadProps {
  bucket: string;
  filePath: string;
  currentFileUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  filePath,
  currentFileUrl,
  onUploadSuccess,
  onRemove,
  label,
}) => {
  const [isUploading, setIsLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. O limite é 5MB.');
      return;
    }

    setIsLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${filePath}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onUploadSuccess(data.publicUrl);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inputUrl.trim()) {
      console.log('Salvando URL colada:', inputUrl.trim());
      onUploadSuccess(inputUrl.trim());
      setInputUrl('');
      setShowUrlInput(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      {label ? <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</p> : null}
      {currentFileUrl ? (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl group shadow-sm transition-all hover:border-blue-200">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
              <FileText className="w-4 h-4 flex-shrink-0" />
            </div>
            <div className="overflow-hidden">
              <a 
                href={currentFileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-black text-blue-700 hover:underline uppercase tracking-[0.1em] block truncate"
              >
                Visualizar Anexo
              </a>
              <p className="text-[9px] text-blue-400 truncate max-w-[180px] font-medium">{currentFileUrl}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 hover:bg-red-100 rounded-full text-blue-300 hover:text-red-500 transition-all ml-2"
            title="Remover anexo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {!showUrlInput ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-600 py-4 rounded-2xl border border-slate-200 border-dashed transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Upload className="w-4 h-4" />}
                <span>{isUploading ? 'Enviando...' : 'Upload'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="flex-1 flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-600 py-4 rounded-2xl border border-slate-200 border-dashed transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Link Externo</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Cole o link da imagem/PDF..."
                className="flex-1 px-5 py-4 bg-white border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-700 shadow-lg shadow-blue-100"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit(e as any)}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="bg-blue-600 text-white px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="bg-slate-100 text-slate-400 px-4 rounded-2xl hover:bg-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
    </div>
  );
};
