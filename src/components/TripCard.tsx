import React from 'react';
import { Calendar, Users, MapPin, ChevronRight, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TripCardProps {
  id: string;
  destination: string;
  nickname?: string | null;
  start_date: string;
  end_date: string;
  people_count: number;
  location_image_url?: string | null;
  onClick: (id: string) => void;
  onEdit?: (e: React.MouseEvent, id: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  id,
  destination,
  nickname,
  start_date,
  end_date,
  people_count,
  location_image_url,
  onClick,
  onEdit,
}) => {
  const startDate = new Date(start_date + 'T00:00:00');
  const displayTitle = nickname || destination.split(',')[0];
  const imageUrl = location_image_url || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop`;

  return (
    <div
      onClick={() => onClick(id)}
      className="relative h-72 rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group"
    >
      <img 
        src={imageUrl} 
        alt={destination}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
      
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
        <button
          onClick={(e) => onEdit && onEdit(e, id)}
          className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all shadow-xl"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="space-y-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center space-x-2 text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="truncate max-w-[150px]">{destination}</span>
          </div>
          
          <h3 className="text-3xl font-black text-white leading-tight tracking-tighter">
            {displayTitle}
          </h3>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <div className="flex items-center space-x-5">
              <div className="flex items-center space-x-2 text-white/80 text-[10px] font-black uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{format(startDate, "MMM yyyy", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-[10px] font-black uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>{people_count} {people_count === 1 ? 'Viajante' : 'Viajantes'}</span>
              </div>
            </div>
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-900/20">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
