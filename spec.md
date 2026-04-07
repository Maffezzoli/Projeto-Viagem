Gemini said
Aqui está o conteúdo completo e estruturado para o seu arquivo spec.md. Ele foi escrito para que o Gemini CLI (ou qualquer agente de IA focado em desenvolvimento) entenda exatamente a arquitetura, o design e as regras de negócio sem ambiguidades.

Specification: Personal Travel Planner (PWA)
1. Project Overview
Um aplicativo de planejamento de viagens minimalista, mobile-first, para uso pessoal. O foco é a centralização de informações logísticas (passagens e hospedagem) e o roteiro diário com suporte a documentos e links do Google Maps.

2. Tech Stack
Frontend: React + Vite (Tailwind CSS para estilização).

UI Components: Shadcn/UI (especificamente Accordion, Card e Button).

Icons: Lucide React.

Backend/Database: Supabase (PostgreSQL).

Storage: Supabase Storage (para PDFs e imagens).

3. Security & Access (Gate Page)
Authentication: Não haverá sistema de Sign Up.

Access Control: Uma tela inicial (Gate Page) com um input de senha.

Hardcoded Credential: Senha: senha1234.

Session Management: Ao validar a senha, o app deve armazenar um token/flag no localStorage ou sessionStorage para manter o usuário logado durante a sessão.

4. Database Schema (Supabase)
Table: trips

id: uuid (primary key)

destination: text

start_date: date

end_date: date

people_count: integer

created_at: timestamp

Table: trip_details (One-to-One with trips)

trip_id: uuid (foreign key)

accommodation_snippet: text (Markdown/Plain text)

transport_snippet: text (Markdown/Plain text)

accommodation_file_url: text (link para storage)

transport_file_url: text (link para storage)

Table: daily_activities (One-to-Many with trips)

id: uuid (primary key)

trip_id: uuid (foreign key)

activity_date: date

time_range: text (ex: "10:00 - 12:00")

description: text

maps_url: text

file_url: text (anexo de ingresso/voucher)

location_image_url: text (URL da imagem de preview do local)

5. UI/UX Requirements
A. Dashboard (Home)

Lista de viagens cadastradas em cards simples.

Botão flutuante ou no topo para "Adicionar Nova Viagem".

B. Trip View (Internal)

Header Snippets:

Dois blocos quadrados posicionados lado a lado no topo da tela.

Bloco 1: "Hospedagem" | Bloco 2: "Passagens".

Cada bloco contém: Área de texto editável e um botão de upload (ícone de clipe).

Autosave: Qualquer alteração no texto deve ser salva no banco após 1 segundo de inatividade (debounce) ou ao perder o foco (blur).

Daily Planning (Accordions):

Abaixo dos blocos, uma lista de retângulos expansíveis.

Cada retângulo representa um dia da viagem (ex: "Dia 1 - 15/10").

Ao expandir:

Lista de atividades ordenadas cronologicamente.

Campo para adicionar nova atividade (Hora, Descrição, Link Maps, Anexo).

Google Maps Integration:

Se um maps_url for detectado, exibir um card de preview com imagem do local e link direto para o app do Google Maps.

6. Functional Requirements
File Upload: Upload de arquivos diretamente para o Supabase Storage, vinculando a URL gerada à tabela correspondente.

Dynamic Days: Ao criar uma viagem, o sistema deve gerar automaticamente os slots de dias baseando-se no start_date e end_date.

Responsividade: Layout focado 100% em dispositivos móveis, mas funcional em desktop.

Offline Hint: Exibir um indicador visual de "Sincronizando..." ou "Salvo" para dar feedback do autosave.