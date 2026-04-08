import React, { useState } from 'react';
import { ChevronDown, Plus, Clock, Calendar, Eye, Utensils, Compass, MapPin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityModal } from './ActivityModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

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

interface DailyPlanProps {
  tripId: string;
  activities: Activity[];
  startDate: string;
  endDate: string;
  onUpdate: (silent?: boolean) => void;
  isReadOnly?: boolean;
}

export const DailyPlan: React.FC<DailyPlanProps> = ({
  tripId,
  activities,
  startDate,
  endDate,
  onUpdate,
  isReadOnly = false,
}) => {
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [expandedItineraries, setExpandedItineraries] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [parentForNewActivity, setParentId] = useState<string | null>(null);

  const getDaysArray = () => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const days = [];
    let current = new Date(start);
    while (current <= end) {
      days.push(format(current, 'yyyy-MM-dd'));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days = getDaysArray();

  const toggleDay = (day: string) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleItinerary = (id: string) => {
    setExpandedItineraries(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddActivity = (day: string, parentId: string | null = null) => {
    setSelectedDate(day);
    setSelectedActivity(undefined);
    setParentId(parentId);
    setIsModalOpen(true);
  };

  const renderActivityCard = (activity: Activity, isSuggestion = false) => {
    const isRestaurant = activity.activity_type === 'restaurant';
    const isTour = activity.activity_type === 'tour';
    const isMain = !isSuggestion;
    const hasChildren = activities.some(a => a.parent_id === activity.id);
    const isExpanded = expandedItineraries.includes(activity.id);
    const childActivities = activities.filter(a => a.parent_id === activity.id);

    return (
      <div key={activity.id} className="space-y-3">
        <div
          className={`group relative transition-all duration-300 ${
            isMain 
              ? 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-900'
              : 'bg-slate-50/50 dark:bg-slate-800/50 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 scale-95 origin-left ml-8'
          }`}
        >
          {/* Main Click Area for Modal */}
          <div 
            onClick={() => {
              setSelectedDate(activity.activity_date);
              setSelectedActivity(activity);
              setParentId(activity.parent_id || null);
              setIsModalOpen(true);
            }}
            className="p-6 cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider ${
                    isRestaurant ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' : 
                    isTour ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 
                    'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  }`}>
                    {isRestaurant ? <Utensils className="w-3 h-3" /> : isTour ? <Compass className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                    <span>{isRestaurant ? 'Restaurante' : isTour ? 'Passeio' : 'Roteiro Principal'}</span>
                  </div>
                  
                  {activity.time_range && (
                    <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      <span>{activity.time_range}</span>
                    </div>
                  )}

                  {isMain && hasChildren && (
                    <div className="flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      <span>{childActivities.length} Sugestões</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isReadOnly && isMain && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddActivity(activity.activity_date, activity.id);
                      }}
                      className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer"
                      title="Adicionar Sugestão"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  {activity.maps_url && (
                    <a href={activity.maps_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-blue-600 rounded-xl transition-all cursor-pointer">
                      <MapPin className="w-4 h-4" />
                    </a>
                  )}
                  {activity.file_url && (
                    <a href={activity.file_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl transition-all cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="prose dark:prose-invert prose-slate max-w-none text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activity.description}</ReactMarkdown>
              </div>
              
              {/* Maps Preview replaced with simple elegant link */}
              {activity.maps_url && (
                <div className="pt-2">
                  <a 
                    href={activity.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Ver Endereço no Mapa</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Expand Toggle for Main Cards with Children */}
          {isMain && hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleItinerary(activity.id);
              }}
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Render Children */}
        <AnimatePresence>
          {isMain && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3 pt-2"
            >
              {childActivities.map(child => renderActivityCard(child, true))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
          O Plano <span className="text-blue-600">Diário.</span>
        </h2>
      </div>

      <div className="space-y-6">
        {days.map((day, index) => {
          const dayDate = new Date(day + 'T00:00:00');
          const dayActivities = activities.filter(a => a.activity_date === day);
          const topLevelActivities = dayActivities.filter(a => !a.parent_id);
          const isExpanded = expandedDays.includes(day);

          return (
            <div key={day} className="space-y-4">
              <button
                onClick={() => toggleDay(day)}
                className={`w-full px-8 py-6 flex items-center justify-between rounded-[2.5rem] transition-all cursor-pointer ${
                  isExpanded 
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-blue-400'
                }`}
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${dayActivities.length > 0 ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <span className="text-[10px] uppercase opacity-70">Dia</span>
                    <span className="text-2xl">{index + 1}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-xl capitalize tracking-tight">
                      {format(dayDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isExpanded ? 'text-white/50' : 'text-slate-400'}`}>
                      {topLevelActivities.length} blocos de roteiro
                    </p>
                  </div>
                </div>
                <div className={`p-2 transition-all ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-6 h-6" />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 px-4 md:px-8 pb-12"
                  >
                    {topLevelActivities.length > 0 ? (
                      <div className="space-y-6">
                        {topLevelActivities.map(act => renderActivityCard(act))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.3em]">Nada planejado para hoje</p>
                      </div>
                    )}

                    {!isReadOnly && (
                      <button
                        onClick={() => handleAddActivity(day)}
                        className="w-full py-6 flex items-center justify-center space-x-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-400 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-900 transition-all text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Novo Bloco de Roteiro</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setParentId(null);
        }}
        onSuccess={() => onUpdate(true)}
        tripId={tripId}
        activityDate={selectedDate}
        activity={selectedActivity}
        isReadOnly={isReadOnly}
        parentId={parentForNewActivity}
      />
    </div>
  );
};
