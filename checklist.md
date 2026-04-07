# Personal Travel Planner - Development Checklist

Este documento serve como o plano de desenvolvimento passo a passo para o aplicativo. Sempre que uma nova feature for desenvolvida, ela deve ser acompanhada de seus respectivos **Testes Integrados** e **Testes de Segurança**.

## 🚀 Fase 1: Setup do Projeto
- [x] Criar arquivo `spec.md` com a especificação técnica.
- [x] Criar arquivo `supabase_implementation.md` com a modelagem do BD.
- [x] Configurar variáveis de ambiente (`.env`).
- [x] Inicializar projeto React + Vite (TypeScript).
- [x] Configurar Tailwind CSS.
- [x] Configurar bibliotecas de UI (Lucide React, Shadcn/UI base).
- [x] Configurar o cliente Supabase (`@supabase/supabase-js`).
- [x] Configurar ambiente de Testes (Vitest + React Testing Library).

## 🗄️ Fase 2: Banco de Dados & Infraestrutura (Supabase)
- [x] Executar SQL de criação de tabelas (`trips`, `trip_details`, `daily_activities`).
- [x] Executar SQL das functions e triggers (Automação de dias, `updated_at`).
- [x] Configurar bucket no Supabase Storage (`travel-assets`).
- [x] Configurar Row Level Security (RLS) no Supabase.
- [x] 🧪 **Testes de Segurança:** Validar se RLS bloqueia acessos sem as credenciais/políticas corretas.

## 🔐 Fase 3: Segurança e Acesso (Gate Page)
- [x] Criar página inicial de bloqueio (Gate Page).
- [x] Implementar validação da senha hardcoded.
- [x] Gerenciamento de sessão (salvar estado de login no `localStorage` / `sessionStorage`).
- [x] 🧪 **Testes Integrados:** Fluxo de login com senha correta e incorreta. Manutenção de sessão ao recarregar.
- [x] 🧪 **Testes de Segurança:** Garantir que rotas internas são inacessíveis sem o estado de sessão ativo.

## 🏠 Fase 4: Dashboard & Gestão de Viagens
- [x] Criar layout base (Header, conteúdo principal).
- [x] Implementar listagem de viagens (Cards).
- [x] Implementar fluxo de "Adicionar Nova Viagem" (Modal ou Página).
- [x] Integração com Supabase para Inserir e Listar `trips`.
- [x] 🧪 **Testes Integrados:** Criar nova viagem e verificar se aparece no Dashboard. Validar datas inválidas.

## 📝 Fase 5: Visualização da Viagem & Autosave
- [x] Criar interface interna da Viagem (Trip View).
- [x] Implementar Blocos de Snippets (Hospedagem e Passagens).
- [x] Desenvolver lógica de Autosave (debounce e blur) para os snippets de texto.
- [x] Integração com Supabase para atualizar `trip_details`.
- [x] 🧪 **Testes Integrados:** Validar se a alteração de texto aciona o salvamento automático após o delay esperado.
- [x] 🧪 **Testes de Segurança:** Validar se a rota de update aceita apenas parâmetros esperados, prevenindo injeções.

## 📅 Fase 6: Planejamento Diário
- [x] Renderizar lista de dias (Accordions) baseada nas datas da viagem.
- [x] Validar a criação automática de dias via Trigger do Supabase.
- [x] Implementar formulário/modal para adicionar/editar atividades em um dia específico.
- [x] Integração com Google Maps (Detectar `maps_url` e exibir preview).
- [x] 🧪 **Testes Integrados:** Adicionar nova atividade. Verificar ordenação cronológica no frontend. Validar extração de dados do Maps.

## ⚡ Fase 6.1: Otimização de UX e Salvamento Silencioso
- [x] Refatorar `fetchTripData` para evitar o estado de `isLoading` (skeleton) em atualizações de dados existentes.
- [x] Implementar atualizações otimistas ou silenciosas no `DailyPlan` e `SnippetBlock`.
- [x] Garantir que o feedback de "Salvando..." ocorra sem travar a interface ou resetar o scroll.

## 📎 Fase 7: Upload de Arquivos
- [x] Implementar botão de anexo nos Snippets.
- [x] Implementar botão de anexo nas Atividades.
- [x] Integração com Supabase Storage para upload e obtenção de URL.
- [x] Salvamento das URLs nas tabelas `trip_details` e `daily_activities`.

## 🎨 Fase 7.1: Estética Moderna e UI Premium
- [x] Implementar Suporte a Markdown (`.md`) nos Snippets e Atividades.
- [x] Preview visual de Google Maps (Extrair imagem/card do link).
- [x] Seletor de lugares inteligente (Autocomplete via API).
- [x] Header dinâmico com imagem real do destino (estilo Hero moderno).
- [x] Refinar espaçamentos, tipografia e transições para visual "Premium".

## ✨ Fase 8: Polimento Final
- [ ] Implementar "Offline Hint" (Indicadores de "Salvando...", "Salvo").
- [ ] Revisão geral de UI/UX e Responsividade (Mobile-first).
- [ ] Revisão das regras de negócio e acoplamento de código (ver pasta `rules/`).
- [ ] 🧪 **Testes E2E Completos:** Rodar a suíte inteira verificando as jornadas principais.
