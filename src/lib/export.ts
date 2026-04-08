import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { marked } from 'marked';

interface TripData {
  destination: string;
  nickname?: string | null;
  start_date: string;
  end_date: string;
  people_count: number;
  location_image_url?: string | null;
}

interface Activity {
  id: string;
  activity_date: string;
  time_range: string | null;
  description: string;
  activity_type?: string;
  parent_id?: string | null;
}

interface ExportProps {
  trip: TripData;
  details: any;
  activities: Activity[];
  theme: 'light' | 'dark';
}

export const exportTripToPDF = async (data: ExportProps) => {
  const { trip, details, activities, theme } = data;
  
  const displayTitle = trip.nickname || trip.destination.split(',')[0];
  const heroImage = trip.location_image_url || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop`;

  // Sort and group activities by date and parent-child relationship
  const dates = Array.from(new Set(activities.map(a => a.activity_date))).sort();
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Por favor, permita pop-ups para exportar o PDF.");
    return;
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#020617' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const cardBg = isDark ? '#0f172a' : '#f8fafc';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const mutedText = isDark ? '#94a3b8' : '#64748b';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR" class="${theme}">
    <head>
      <meta charset="UTF-8">
      <title>Roteiro - ${displayTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        
        @page {
          margin: 0;
          size: A4;
        }
        
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          background-color: ${bgColor};
          color: ${textColor};
          line-height: 1.6;
        }

        .hero {
          position: relative;
          height: 450px;
          width: 100%;
          background-image: url('${heroImage}');
          background-size: cover;
          background-position: center;
          page-break-after: avoid;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(15,23,42,0.2), ${bgColor});
        }

        .hero-content {
          position: absolute;
          bottom: 60px;
          left: 60px;
          right: 60px;
        }

        .title {
          font-size: 72px;
          font-weight: 900;
          margin: 0;
          line-height: 0.9;
          letter-spacing: -4px;
          color: ${textColor};
        }

        .subtitle {
          font-size: 20px;
          font-weight: 700;
          margin-top: 15px;
          color: ${mutedText};
          text-transform: uppercase;
          letter-spacing: 4px;
        }

        .container {
          padding: 60px;
        }

        .info-grid {
          display: flex;
          gap: 80px;
          margin-bottom: 60px;
          padding-bottom: 40px;
          border-bottom: 2px solid ${borderColor};
          page-break-inside: avoid;
        }

        .info-block label {
          display: block;
          font-size: 11px;
          font-weight: 900;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 8px;
        }

        .info-block p {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 80px;
          page-break-inside: avoid;
        }

        .card {
          background: ${cardBg};
          padding: 40px;
          border-radius: 30px;
          border: 1px solid ${borderColor};
        }

        .card h2 {
          font-size: 14px;
          font-weight: 900;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin: 0 0 30px 0;
        }

        .field-row {
          margin-bottom: 20px;
        }

        .field-row.flex {
          display: flex;
          gap: 40px;
        }

        .field-label {
          font-size: 10px;
          font-weight: 900;
          color: ${mutedText};
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .field-val {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }

        .field-val.accent {
          color: #2563eb;
        }

        .divider {
          height: 1px;
          background: ${borderColor};
          margin: 25px 0;
        }

        .section-title {
          font-size: 28px;
          font-weight: 900;
          color: ${textColor};
          margin: 0 0 60px 0;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 6px;
          page-break-after: avoid;
        }

        .day-block {
          margin-bottom: 80px;
          page-break-inside: avoid;
        }

        .day-header {
          display: flex;
          align-items: center;
          gap: 25px;
          margin-bottom: 40px;
        }

        .day-badge {
          background: #2563eb;
          color: white;
          padding: 12px 25px;
          border-radius: 15px;
          font-weight: 900;
          font-size: 20px;
        }

        .day-title {
          font-size: 24px;
          font-weight: 900;
          color: ${textColor};
          margin: 0;
          text-transform: capitalize;
        }

        .activity {
          margin-left: 40px;
          margin-bottom: 35px;
          padding-left: 30px;
          border-left: 3px solid ${borderColor};
          position: relative;
        }

        .activity.suggestion {
          margin-left: 80px;
          border-left: 3px dashed ${borderColor};
          opacity: 0.8;
        }

        .dot {
          position: absolute;
          left: -10px;
          top: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid ${bgColor};
        }

        .activity.suggestion .dot {
          background: ${mutedText};
          width: 12px;
          height: 12px;
          left: -8px;
          top: 4px;
        }

        .act-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
        }

        .time-badge {
          font-size: 11px;
          font-weight: 900;
          color: #2563eb;
          background: #eff6ff;
          padding: 5px 12px;
          border-radius: 8px;
          text-transform: uppercase;
        }

        .type-badge {
          font-size: 10px;
          font-weight: 800;
          color: ${mutedText};
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .markdown-body {
          font-size: 16px;
          color: ${textColor};
          font-weight: 500;
        }
        
        .markdown-body p { margin: 0 0 12px 0; }
        .markdown-body ul { margin: 0 0 12px 0; padding-left: 25px; }
        .markdown-body strong { color: ${textColor}; font-weight: 800; }
        .markdown-body a { color: #2563eb; text-decoration: none; border-bottom: 1px solid #2563eb; }
      </style>
    </head>
    <body>
      <div class="hero">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="title">${displayTitle}</h1>
          <p class="subtitle">${trip.destination}</p>
        </div>
      </div>

      <div class="container">
        <div class="info-grid">
          <div class="info-block">
            <label>Período da Viagem</label>
            <p>${format(new Date(trip.start_date + 'T00:00:00'), "dd MMM")} - ${format(new Date(trip.end_date + 'T00:00:00'), "dd MMM yyyy")}</p>
          </div>
          <div class="info-block">
            <label>Número de Viajantes</label>
            <p>${trip.people_count} ${trip.people_count === 1 ? 'Viajante' : 'Viajantes'}</p>
          </div>
        </div>

        <div class="cards-grid">
          <div class="card">
            <h2>Hospedagem Principal</h2>
            <div class="field-row">
              <p class="field-label">LOCAL</p>
              <p class="field-val">${details.accommodation_name || 'Não informado'}</p>
            </div>
            <div class="field-row flex">
              <div>
                <p class="field-label">IN</p>
                <p class="field-val">${details.accommodation_checkin || '—'}</p>
              </div>
              <div>
                <p class="field-label">OUT</p>
                <p class="field-val">${details.accommodation_checkout || '—'}</p>
              </div>
            </div>
            <div class="field-row">
              <p class="field-label">ENDEREÇO</p>
              <p class="field-val" style="font-size: 13px; color: ${mutedText};">${details.accommodation_address || '—'}</p>
            </div>
          </div>

          <div class="card">
            <h2>Logística de Transporte</h2>
            
            <p class="field-label" style="color: #2563eb; font-weight: 900;">IDA • ${details.transport_company || 'Empresa'}</p>
            <div class="field-row flex" style="margin-top: 15px;">
              <div>
                <p class="field-label">PARTIDA</p>
                <p class="field-val">${details.transport_departure_location || '—'}</p>
                <p class="field-val accent">${details.transport_departure_time || ''}</p>
              </div>
              <div>
                <p class="field-label">CHEGADA</p>
                <p class="field-val">${details.transport_arrival_location || '—'}</p>
                <p class="field-val accent">${details.transport_arrival_time || ''}</p>
              </div>
            </div>

            ${(details.transport_return_company || details.transport_return_departure_location) ? `
              <div class="divider"></div>
              <p class="field-label" style="color: #2563eb; font-weight: 900;">VOLTA • ${details.transport_return_company || 'Empresa'}</p>
              <div class="field-row flex" style="margin-top: 15px;">
                <div>
                  <p class="field-label">PARTIDA</p>
                  <p class="field-val">${details.transport_return_departure_location || '—'}</p>
                  <p class="field-val accent">${details.transport_return_departure_time || ''}</p>
                </div>
                <div>
                  <p class="field-label">CHEGADA</p>
                  <p class="field-val">${details.transport_return_arrival_location || '—'}</p>
                  <p class="field-val accent">${details.transport_return_arrival_time || ''}</p>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <h2 class="section-title">O Plano Diário</h2>
        
        ${dates.map((date, index) => {
          const dayActivities = activities.filter(a => a.activity_date === date);
          const mains = dayActivities.filter(a => !a.parent_id);
          
          return `
            <div class="day-block">
              <div class="day-header">
                <div class="day-badge">${index + 1}</div>
                <h3 class="day-title">${format(new Date(date + 'T00:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}</h3>
              </div>
              
              ${mains.map(mainAct => {
                const subs = dayActivities.filter(a => a.parent_id === mainAct.id);
                
                const renderAct = (act: Activity, isSub: boolean) => `
                  <div class="activity ${isSub ? 'suggestion' : ''}">
                    <div class="dot"></div>
                    <div class="act-meta">
                      <span class="time-badge">${act.time_range || 'Horário flexível'}</span>
                      ${act.activity_type && act.activity_type !== 'itinerary' ? `<span class="type-badge">• ${act.activity_type === 'restaurant' ? 'Restaurante' : 'Passeio'}</span>` : ''}
                    </div>
                    <div class="markdown-body">
                      ${marked.parse(act.description || '')}
                    </div>
                  </div>
                `;

                return `
                  ${renderAct(mainAct, false)}
                  ${subs.map(sub => renderAct(sub, true)).join('')}
                `;
              }).join('')}
            </div>
          `;
        }).join('')}

      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 800);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
