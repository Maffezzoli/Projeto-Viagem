import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trip: any;
  details: any;
  activities: any[];
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  trip,
  details,
  activities,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [isAICopying, setIsAICopying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getExportData = () => {
    return {
      trip: {
        destination: trip.destination,
        nickname: trip.nickname,
        start_date: trip.start_date,
        end_date: trip.end_date,
        people_count: trip.people_count,
        location_image_url: trip.location_image_url,
      },
      details: {
        accommodation_name: details.accommodation_name,
        accommodation_checkin: details.accommodation_checkin,
        accommodation_checkout: details.accommodation_checkout,
        accommodation_address: details.accommodation_address,
        transport_type: details.transport_type,
        transport_company: details.transport_company,
        transport_departure_location: details.transport_departure_location,
        transport_arrival_location: details.transport_arrival_location,
        transport_departure_time: details.transport_departure_time,
        transport_arrival_time: details.transport_arrival_time,
        transport_return_company: details.transport_return_company,
        transport_return_departure_location: details.transport_return_departure_location,
        transport_return_arrival_location: details.transport_return_arrival_location,
        transport_return_departure_time: details.transport_return_departure_time,
        transport_return_arrival_time: details.transport_return_arrival_time,
      },
      activities: activities.map(a => ({
        id: a.id,
        activity_date: a.activity_date,
        time_range: a.time_range,
        description: a.description,
        maps_url: a.maps_url,
        file_url: a.file_url,
        activity_type: a.activity_type,
        parent_id: a.parent_id,
      })),
    };
  };

  const handleExport = () => {
    const data = getExportData();
    const json = JSON.stringify(data, null, 2);
    setJsonText(json);
    navigator.clipboard.writeText(json);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleAICopy = () => {
    const data = getExportData();
    const prompt = `Aja como um Planejador de Viagens Especialista. Abaixo está a estrutura JSON de um roteiro. 
Sua tarefa é PREENCHER ou MELHORAR este roteiro mantendo EXATAMENTE esta estrutura.

REGRAS CRÍTICAS DE PREENCHIMENTO:
1. "activity_type": Deve ser 'itinerary' (bloco principal), 'restaurant' (sugestão de comida) ou 'tour' (sugestão de passeio).
2. ANINHAMENTO (SUB-CARDS): Para que um card seja filho de outro, o "parent_id" dele deve ser EXATAMENTE igual ao "id" do card pai.
3. IDs: Você pode inventar novos IDs (formato UUID) para novas atividades, garantindo que o "parent_id" aponte corretamente para o "id" do pai.
4. MARKDOWN: Use Markdown (negrito, listas, links) na descrição.
5. DATAS: Respeite o intervalo ${data.trip.start_date} a ${data.trip.end_date}.

ESTRUTURA ATUAL:
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Responda APENAS com o JSON completo e atualizado dentro de um bloco de código.`;

    navigator.clipboard.writeText(prompt);
    setIsAICopying(true);
    setTimeout(() => setIsAICopying(false), 2000);
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // 1. Clean JSON input (remove Markdown code blocks if present)
      const cleanedJson = jsonText.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanedJson);
      
      if (!data.trip || !data.details || !Array.isArray(data.activities)) {
        throw new Error('Formato JSON inválido.');
      }

      // 2. Update Trip & Details
      const { error: tripError } = await supabase.from('trips').update(data.trip).eq('id', trip.id);
      if (tripError) throw tripError;

      const { error: detailsError } = await supabase.from('trip_details').update(data.details).eq('trip_id', trip.id);
      if (detailsError) throw detailsError;

      // 3. Prepare Activities with new IDs to avoid conflicts and preserve hierarchy
      const oldToNewIdMap: Record<string, string> = {};
      
      // Generate new UUIDs for everything and map them
      const preparedActivities = data.activities.map((act: any) => {
        const newId = crypto.randomUUID();
        if (act.id) oldToNewIdMap[act.id] = newId;
        return { 
          ...act, 
          id: newId, 
          trip_id: trip.id,
          // Temporary hold the old parent_id to resolve it in the next step
          _oldParentId: act.parent_id 
        };
      });

      // Resolve new parent_id values
      preparedActivities.forEach((act: any) => {
        if (act._oldParentId && oldToNewIdMap[act._oldParentId]) {
          act.parent_id = oldToNewIdMap[act._oldParentId];
        } else {
          act.parent_id = null;
        }
        delete act._oldParentId; // Clean up
      });

      // 4. Delete existing activities
      const { error: deleteError } = await supabase.from('daily_activities').delete().eq('trip_id', trip.id);
      if (deleteError) throw deleteError;

      // 5. Insert in two batches to respect Foreign Key constraints
      const parents = preparedActivities.filter((a: any) => !a.parent_id);
      const children = preparedActivities.filter((a: any) => a.parent_id);

      if (parents.length > 0) {
        const { error: pErr } = await supabase.from('daily_activities').insert(parents);
        if (pErr) throw pErr;
      }

      if (children.length > 0) {
        const { error: cErr } = await supabase.from('daily_activities').insert(children);
        if (cErr) throw cErr;
      }

      setSuccess(true);
      onSuccess();
      setTimeout(onClose, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar JSON.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
      >
        <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Portabilidade & I.A</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sincronize ou turbine com I.A</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExport}
              className="flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white font-black py-4 rounded-2xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700 uppercase tracking-widest text-[10px] cursor-pointer"
            >
              {isCopying ? <><Check className="w-4 h-4 text-green-500" /><span>JSON Copiado</span></> : <><Copy className="w-4 h-4" /><span>Copiar JSON</span></>}
            </button>

            <button
              onClick={handleAICopy}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 uppercase tracking-widest text-[10px] cursor-pointer"
            >
              {isAICopying ? <><Check className="w-4 h-4" /><span>Prompt Copiado</span></> : <><Sparkles className="w-4 h-4" /><span>Copiar para I.A</span></>}
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              <span className="font-black uppercase mr-1">Dica:</span> 
              Ao clicar em "Copiar para I.A", o app gera um prompt mestre. Cole no ChatGPT e peça para ele preencher. O sistema agora reconstrói automaticamente a hierarquia de sub-cards!
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Importar JSON</label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Cole aqui o JSON gerado pela I.A..."
              className="w-full h-48 px-5 py-4 bg-slate-50 dark:bg-slate-800 dark:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
              <Check className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Importação concluída!</p>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={isLoading || !jsonText.trim()}
            className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-[10px] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Importar & Sincronizar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
