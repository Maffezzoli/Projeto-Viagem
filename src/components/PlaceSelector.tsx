import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface Place {
  name: string;
  country: string;
  city?: string;
  full_name: string;
}

interface PlaceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PlaceSelector: React.FC<PlaceSelectorProps> = ({
  value,
  onChange,
  placeholder = "Para onde vamos?",
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const fetchSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using Photon API (OpenStreetMap) - much more detailed
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&limit=5`);
      const data = await response.json();
      
      const placeSuggestions = data.features.map((feature: any) => {
        const p = feature.properties;
        const name = p.name || '';
        const city = p.city || p.state || '';
        const country = p.country || '';
        
        const full_name = [name, city, country].filter(Boolean).join(', ');
        
        return {
          name: name,
          city: city,
          country: country,
          full_name: full_name,
        };
      });

      setSuggestions(placeSuggestions);
      setIsOpen(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelect = (place: Place) => {
    setQuery(place.full_name);
    onChange(place.full_name);
    setSuggestions([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-[60] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((place, index) => (
            <button
              key={index}
              onClick={() => handleSelect(place)}
              className="w-full px-5 py-4 text-left hover:bg-blue-50 flex items-center space-x-4 transition-colors border-b border-slate-50 last:border-0 group"
            >
              <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{place.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium truncate">
                  {place.city}{place.city && place.country ? ' • ' : ''}{place.country}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
