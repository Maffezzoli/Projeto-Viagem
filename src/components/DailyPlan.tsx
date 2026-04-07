import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Clock, Calendar, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityModal } from './ActivityModal';
import { MapsPreview } from './MapsPreview';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Activity {
  id: string;
  trip_id: string;
  activity_date: string;
  time_range: string | null;
  description: string;
  maps_url: string | null;
  file_url?: string | null;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tighter">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-600/20 text-white">
            <Calendar className="w-6 h-6" />
          </div> 
          Roteiro Diário
        </h2>
      </div>

      <div className="space-y-4">
        {days.map((day, index) => {
          const dayDate = new Date(day + 'T00:00:00');
          const dayActivities = activities.filter(a => a.activity_date === day);
          const isExpanded = expandedDays.includes(day);

          return (
            <div key={day} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-blue-200 dark:hover:border-blue-900">
              <button
                onClick={() => toggleDay(day)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-14 h-14 rounded-[1.25rem] flex flex-col items-center justify-center font-black transition-all ${dayActivities.length > 0 ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <span className="text-[10px] leading-none uppercase tracking-tighter opacity-70 mb-0.5">Dia</span>
                    <span className="text-2xl leading-none">{index + 1}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-slate-900 dark:text-white text-xl capitalize tracking-tight">
                      {format(dayDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">
                      {dayActivities.length} {dayActivities.length === 1 ? 'atividade' : 'atividades'}
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-full transition-all ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rotate-180' : 'text-slate-300 dark:text-slate-700'}`}>
                  <ChevronDown className="w-6 h-6" />
                </div>
              </button>

              {isExpanded && (
                <div className="px-8 pb-8 pt-2 space-y-6 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/20">
                  {dayActivities.length > 0 ? (
                    <div className="space-y-5">
                      {dayActivities.map((activity) => (
                        <div
                          key={activity.id}
                          onClick={() => {
                            if (!isReadOnly) {
                              setSelectedDate(day);
                              setSelectedActivity(activity);
                              setIsModalOpen(true);
                            }
                          }}
                          className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-all group relative ${isReadOnly ? '' : 'hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-900 cursor-pointer'}`}
                        >
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider ${activity.time_range ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{activity.time_range || 'Horário flexível'}</span>
                                </div>
                                
                                {activity.file_url && (
                                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Possui Anexo</span>
                                  </div>
                                )}
                              </div>

                              {activity.file_url && (
                                <a 
                                  href={activity.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Ver Anexo</span>
                                </a>
                              )}
                            </div>

                            <div className="prose dark:prose-invert prose-slate max-w-none text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{activity.description}</ReactMarkdown>
                            </div>
                            
                            {activity.maps_url && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <MapsPreview url={activity.maps_url} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto opacity-50">
                        <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.2em]">Nada planejado ainda</p>
                    </div>
                  )}

                  {!isReadOnly && (
                    <button
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedActivity(undefined);
                        setIsModalOpen(true);
                      }}
                      className="w-full py-5 flex items-center justify-center space-x-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Adicionar Atividade</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => onUpdate(true)}
        tripId={tripId}
        activityDate={selectedDate}
        activity={selectedActivity}
      />
    </div>
  );
};
