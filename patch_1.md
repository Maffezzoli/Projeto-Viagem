# Patch 1: Refatoração de UX, Estrutura e Portabilidade

Este patch foca em resolver problemas críticos de responsividade, transformar blocos de texto em campos estruturados, melhorar a exportação de dados e enriquecer o roteiro diário com sub-atividades.

## 📋 Lista de Tarefas

### 1. 📱 Responsividade & UI
- [x] Corrigir amontoamento de botões no Header da `TripViewPage`.
- [x] Ajustar layout mobile-first em todas as seções internas.
- [x] Remover preview de imagem automática de links do Google Maps.
- [x] Melhorar visibilidade do input de senha na `GatePage`.
- [x] Eliminar flicker de imagem no Dashboard e suavizar transições.

### 2. 🏗️ Estrutura de Dados (Campos Específicos)
- [x] Transformar `accommodation_snippet` em campos: Nome, Check-in, Check-out, Endereço/Link.
- [x] Transformar `transport_snippet` em campos: Tipo, Empresa, Local Partida, Local Chegada, Horários (Ida e Volta).
- [x] Atualizar banco de dados (Supabase) e tipos TypeScript.

### 3. 📅 Novo Roteiro Diário (Sub-cards)
- [x] Refatorar Atividades para suportar tipos: "Roteiro", "Restaurante", "Passeio".
- [x] Implementar visual de sub-cards aninhados dentro do card de roteiro.
- [x] Garantir suporte total a Markdown nas descrições.
- [x] Corrigir acessibilidade de clique nos cards com filhos (botão de expandir dedicado).

### 4. 📤 Portabilidade & I.A (JSON Import/Export)
- [x] Criar modal de Exportar/Importar JSON.
- [x] Implementar função de copiar JSON para o clipboard.
- [x] Implementar função de "Copiar para I.A" com Prompt de Engenharia.
- [x] Implementar lógica de importação em batches (Pais primeiro, Filhos depois) para evitar erros de Foreign Key.

### 5. 📄 Melhoria no PDF
- [x] Implementar suporte a múltiplas páginas no PDF via `window.print()`.
- [x] Ajustar layout do documento para os novos campos estruturados.
- [x] Suporte a temas (Light/Dark) na exportação do PDF.

---
*Status: Concluído e Refinado*
