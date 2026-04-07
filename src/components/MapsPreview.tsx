import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface MapsPreviewProps {
  url: string;
}

export const MapsPreview: React.FC<MapsPreviewProps> = ({ url }) => {
  if (!url) return null;

  const extractPlaceName = (mapsUrl: string) => {
    try {
      if (mapsUrl.includes('/place/')) {
        const part = mapsUrl.split('/place/')[1].split('/')[0];
        return decodeURIComponent(part).replace(/\+/g, ' ');
      }
      return "Localização no Mapa";
    } catch (e) {
      return "Localização no Mapa";
    }
  };

  const placeName = extractPlaceName(url);
  
  // Use a more stable and high-quality travel image as background
  // The keyword is used to find a relevant landmark
  const keyword = placeName.split(' ')[0].toLowerCase();
  const mapPreviewImage = `https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop`; // Default stable map/travel photo
  const dynamicImage = `https://loremflickr.com/800/400/${encodeURIComponent(keyword)},city,landmark/all`;

  return (
    <div className="mt-4 rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group/map bg-white dark:bg-slate-800 transition-all hover:shadow-md">
      <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <img 
          src={dynamicImage} 
          alt={placeName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/map:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = mapPreviewImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">{placeName}</span>
        </div>
      </div>
      
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
      >
        <div className="flex-1 overflow-hidden pr-4">
          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Destino Selecionado</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">{url}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full text-slate-400 group-hover/map:text-blue-600 group-hover/map:bg-blue-50 transition-all">
          <ExternalLink className="w-4 h-4" />
        </div>
      </a>
    </div>
  );
};
