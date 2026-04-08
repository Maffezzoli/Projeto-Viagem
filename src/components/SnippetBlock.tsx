import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check, Cloud, Eye, Edit3, MapPin, Calendar, Building } from 'lucide-react';
import { FileUpload } from './FileUpload';

interface SnippetBlockProps {
  type: 'accommodation' | 'transport';
  title: string;
  icon: LucideIcon;
  details: any;
  onSave: (updates: any) => Promise<void>;
  fileUrl?: string | null;
  onFileSave: (url: string) => Promise<void>;
  onFileRemove: () => Promise<void>;
  tripId: string;
  isReadOnly?: boolean;
}

export const SnippetBlock: React.FC<SnippetBlockProps> = ({
  type,
  title,
  icon: Icon,
  details,
  onSave,
  fileUrl,
  onFileSave,
  onFileRemove,
  tripId,
  isReadOnly = false,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Local state for fields
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (details) {
      setFields({
        accommodation_name: details.accommodation_name || '',
        accommodation_checkin: details.accommodation_checkin || '',
        accommodation_checkout: details.accommodation_checkout || '',
        accommodation_address: details.accommodation_address || '',
        transport_type: details.transport_type || '',
        transport_company: details.transport_company || '',
        transport_departure_location: details.transport_departure_location || '',
        transport_arrival_location: details.transport_arrival_location || '',
        transport_departure_time: details.transport_departure_time || '',
        transport_arrival_time: details.transport_arrival_time || '',
        transport_return_company: details.transport_return_company || '',
        transport_return_departure_location: details.transport_return_departure_location || '',
        transport_return_arrival_location: details.transport_return_arrival_location || '',
        transport_return_departure_time: details.transport_return_departure_time || '',
        transport_return_arrival_time: details.transport_return_arrival_time || '',
      });
    }
  }, [details]);

  const handleFieldChange = (name: string, value: string) => {
    setFields((prev: Record<string, string>) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(fields);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 2000);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderAccommodationView = () => (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <Building className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hotel / Local</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{fields.accommodation_name || 'Não informado'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start space-x-3">
          <Calendar className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Check-in</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{fields.accommodation_checkin || '—'}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Calendar className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Check-out</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{fields.accommodation_checkout || '—'}</p>
          </div>
        </div>
      </div>
      {fields.accommodation_address && (
        <div className="flex items-start space-x-3 pt-2 border-t border-slate-50 dark:border-slate-800">
          <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Endereço / Link</p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{fields.accommodation_address}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTransportView = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
          {fields.transport_type || 'Transporte'}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-blue-500">Ida • {fields.transport_company || 'Empresa'}</p>
        <div className="grid grid-cols-2 gap-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partida</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{fields.transport_departure_location || '—'}</p>
            <p className="text-xs font-black text-blue-600 mt-1">{fields.transport_departure_time}</p>
          </div>
          <div className="text-right md:text-left md:pl-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chegada</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{fields.transport_arrival_location || '—'}</p>
            <p className="text-xs font-black text-blue-600 mt-1">{fields.transport_arrival_time}</p>
          </div>
        </div>
      </div>

      {(fields.transport_return_company || fields.transport_return_departure_location) && (
        <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-widest text-blue-500">Volta • {fields.transport_return_company || 'Empresa'}</p>
          <div className="grid grid-cols-2 gap-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partida</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{fields.transport_return_departure_location || '—'}</p>
              <p className="text-xs font-black text-blue-600 mt-1">{fields.transport_return_departure_time}</p>
            </div>
            <div className="text-right md:text-left md:pl-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chegada</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{fields.transport_return_arrival_location || '—'}</p>
              <p className="text-xs font-black text-blue-600 mt-1">{fields.transport_return_arrival_time}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[320px] transition-all hover:shadow-md">
      <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-600/20 text-white">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-[0.2em]">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          {isSaving && (
            <div className="flex items-center space-x-1.5 text-blue-500 text-[9px] font-black animate-pulse uppercase tracking-widest">
              <Cloud className="w-3 h-3" />
              <span>Salvando</span>
            </div>
          )}
          {hasSaved && (
            <div className="flex items-center space-x-1.5 text-green-500 text-[9px] font-black uppercase tracking-widest">
              <Check className="w-3 h-3" />
              <span>Salvo</span>
            </div>
          )}

          {!isReadOnly && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all cursor-pointer shadow-sm"
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-8">
        {isEditing && !isReadOnly ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {type === 'accommodation' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome do Hotel"
                  value={fields.accommodation_name}
                  onChange={(e) => handleFieldChange('accommodation_name', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Check-in"
                    value={fields.accommodation_checkin}
                    onChange={(e) => handleFieldChange('accommodation_checkin', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Check-out"
                    value={fields.accommodation_checkout}
                    onChange={(e) => handleFieldChange('accommodation_checkout', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Endereço ou Link"
                  value={fields.accommodation_address}
                  onChange={(e) => handleFieldChange('accommodation_address', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Viagem de Ida</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={fields.transport_type}
                      onChange={(e) => handleFieldChange('transport_type', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                    >
                      <option value="">Tipo</option>
                      <option value="Avião">Avião</option>
                      <option value="Trem">Trem</option>
                      <option value="Ônibus">Ônibus</option>
                      <option value="Carro">Carro</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Cia / Empresa"
                      value={fields.transport_company}
                      onChange={(e) => handleFieldChange('transport_company', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Origem"
                      value={fields.transport_departure_location}
                      onChange={(e) => handleFieldChange('transport_departure_location', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Destino"
                      value={fields.transport_arrival_location}
                      onChange={(e) => handleFieldChange('transport_arrival_location', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Hora Partida"
                      value={fields.transport_departure_time}
                      onChange={(e) => handleFieldChange('transport_departure_time', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-xs text-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Hora Chegada"
                      value={fields.transport_arrival_time}
                      onChange={(e) => handleFieldChange('transport_arrival_time', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-xs text-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Viagem de Volta</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="Cia / Empresa (Opcional)"
                    value={fields.transport_return_company}
                    onChange={(e) => handleFieldChange('transport_return_company', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Origem"
                      value={fields.transport_return_departure_location}
                      onChange={(e) => handleFieldChange('transport_return_departure_location', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Destino"
                      value={fields.transport_return_arrival_location}
                      onChange={(e) => handleFieldChange('transport_return_arrival_location', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Hora Partida"
                      value={fields.transport_return_departure_time}
                      onChange={(e) => handleFieldChange('transport_return_departure_time', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-xs text-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Hora Chegada"
                      value={fields.transport_return_arrival_time}
                      onChange={(e) => handleFieldChange('transport_return_arrival_time', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-xs text-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleSave}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[10px] mt-2 cursor-pointer shadow-lg"
            >
              Confirmar Dados
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {type === 'accommodation' ? renderAccommodationView() : renderTransportView()}
          </div>
        )}
      </div>

      <div className="px-8 pb-8 mt-auto">
        <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
          {isReadOnly ? (
            fileUrl && (
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl group transition-all hover:bg-blue-100"
              >
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Ver Comprovante</span>
              </a>
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
