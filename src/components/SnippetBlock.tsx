import React, { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check, Cloud, Eye, Edit3 } from 'lucide-react';
import { FileUpload } from './FileUpload';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SnippetBlockProps {
  title: string;
  icon: LucideIcon;
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  fileUrl?: string | null;
  onFileSave: (url: string) => Promise<void>;
  onFileRemove: () => Promise<void>;
  tripId: string;
  isReadOnly?: boolean;
}

export const SnippetBlock: React.FC<SnippetBlockProps> = ({
  title,
  icon: Icon,
  value,
  onSave,
  placeholder = "Digite os detalhes aqui...",
  fileUrl,
  onFileSave,
  onFileRemove,
  tripId,
  isReadOnly = false,
}) => {
  const [text, setText] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleSave = async (newValue: string) => {
    if (newValue === value) return;
    setIsSaving(true);
    try {
      await onSave(newValue);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 2000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => handleSave(newValue), 1000);
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    handleSave(text);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[300px] transition-all hover:shadow-md">
      <div className="flex items-center justify-between px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 text-white">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-[0.2em]">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 min-w-[80px] justify-end">
            {isSaving ? (
              <div className="flex items-center space-x-1.5 text-blue-500 text-[9px] font-black animate-pulse">
                <Cloud className="w-3 h-3" />
                <span className="uppercase tracking-widest">Saving</span>
              </div>
            ) : hasSaved ? (
              <div className="flex items-center space-x-1.5 text-green-500 text-[9px] font-black">
                <Check className="w-3 h-3" />
                <span className="uppercase tracking-widest">Saved</span>
              </div>
            ) : null}
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer"
            >
              {isEditing ? <><Eye className="w-3 h-3" /><span>Preview</span></> : <><Edit3 className="w-3 h-3" /><span>Edit</span></>}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative">
        {isEditing && !isReadOnly ? (
          <textarea
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full h-full min-h-[180px] p-6 text-slate-700 dark:text-slate-300 text-sm focus:outline-none resize-none bg-transparent font-mono placeholder:italic"
            autoFocus
          />
        ) : (
          <div className="p-6 prose dark:prose-invert prose-slate prose-sm max-w-none min-h-[180px]">
            {text ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            ) : (
              <p className="text-slate-400 dark:text-slate-600 italic">{placeholder}</p>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-6 mt-auto">
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
          {isReadOnly ? (
            fileUrl ? (
              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <Eye className="w-4 h-4" />
                </div>
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-blue-700 dark:text-blue-400 hover:underline uppercase tracking-widest"
                >
                  Visualizar Anexo
                </a>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Nenhum anexo</p>
            )
          ) : (
            <FileUpload
              bucket="travel-assets"
              filePath={`trip-${tripId}-${title.toLowerCase()}`}
              currentFileUrl={fileUrl}
              onUploadSuccess={onFileSave}
              onRemove={onFileRemove}
              label="Anexar Comprovante"
            />
          )}
        </div>
      </div>
    </div>
  );
};
