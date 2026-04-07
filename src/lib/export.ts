import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TripData {
  destination: string;
  nickname?: string | null;
  start_date: string;
  end_date: string;
  people_count: number;
  location_image_url?: string | null;
}

interface Activity {
  activity_date: string;
  time_range: string | null;
  description: string;
}

interface ExportProps {
  trip: TripData;
  details: {
    accommodation_snippet: string;
    transport_snippet: string;
  };
  activities: Activity[];
}

export const exportTripToPDF = async (data: ExportProps) => {
  const { trip, details, activities } = data;
  
  // Create a hidden container for the PDF content
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px'; // A4-ish width
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'sans-serif';
  container.className = 'pdf-export-container';

  const displayTitle = trip.nickname || trip.destination.split(',')[0];
  const heroImage = trip.location_image_url || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop`;

  // HTML Structure for the PDF
  container.innerHTML = `
    <div style="position: relative; height: 300px; width: 100%; overflow: hidden;">
      <img src="${heroImage}" style="width: 100%; height: 100%; object-fit: cover;" />
      <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(15,23,42,0.4), #ffffff);"></div>
      <div style="position: absolute; bottom: 40px; left: 40px;">
        <h1 style="font-size: 48px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -2px;">${displayTitle}</h1>
        <p style="font-size: 18px; font-weight: 700; margin: 5px 0 0 0; color: #475569; text-transform: uppercase; letter-spacing: 2px;">${trip.destination}</p>
      </div>
    </div>

    <div style="padding: 40px; line-height: 1.6;">
      <div style="display: flex; gap: 40px; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
        <div>
          <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin: 0;">Período</p>
          <p style="font-weight: 700;">${format(new Date(trip.start_date + 'T00:00:00'), "dd/MM/yy")} - ${format(new Date(trip.end_date + 'T00:00:00'), "dd/MM/yy")}</p>
        </div>
        <div>
          <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin: 0;">Viajantes</p>
          <p style="font-weight: 700;">${trip.people_count} ${trip.people_count === 1 ? 'pessoa' : 'pessoas'}</p>
        </div>
      </div>

      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 20px; font-weight: 900; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Hospedagem</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px; font-size: 14px; white-space: pre-wrap;">${details.accommodation_snippet || 'Nenhum detalhe informado.'}</div>
      </div>

      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 20px; font-weight: 900; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Transporte</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px; font-size: 14px; white-space: pre-wrap;">${details.transport_snippet || 'Nenhum detalhe informado.'}</div>
      </div>

      <div>
        <h2 style="font-size: 20px; font-weight: 900; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px;">Roteiro Diário</h2>
        ${Array.from(new Set(activities.map(a => a.activity_date))).sort().map(date => {
          const dayActivities = activities.filter(a => a.activity_date === date);
          return `
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; border-left: 4px solid #2563eb; padding-left: 15px; margin-bottom: 15px;">
                ${format(new Date(date + 'T00:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h3>
              ${dayActivities.map(act => `
                <div style="margin-left: 20px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9;">
                  <span style="font-size: 11px; font-weight: 900; color: #2563eb; background: #eff6ff; padding: 2px 8px; border-radius: 5px;">
                    ${act.time_range || 'Horário flexível'}
                  </span>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #334155;">${act.description}</p>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      useCORS: true,
      scale: 2, // Higher quality
      logging: false,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Roteiro_${displayTitle.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Verifique se as imagens carregaram corretamente.');
  } finally {
    document.body.removeChild(container);
  }
};
