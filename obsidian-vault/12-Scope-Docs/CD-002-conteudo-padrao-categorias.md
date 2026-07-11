# CD-002 — Código padrão do projeto + categorias de texto (EN-US/PT-BR)

---
card_id: CD-002
status: grooming
---

# Contexto

Usuário pediu que: (1) o conteúdo padrão de prática seja o próprio código-fonte do TypeSpeed, sem exigir seleção manual de pasta; (2) exista um seletor de categoria permitindo praticar também com textos (não-código) em EN-US e PT-BR sobre datilografia/teclado QWERTY, com arquivos .txt gerados como material de prática.

# Design (DDD/SOLID)

- `CodeFileRepository.loadFromDataset(files)`: novo método que aceita arquivos pré-carregados (mesma forma de dados usada pelo File API), reaproveitando a repositório existente em vez de duplicar lógica (Open/Closed).
- `js/content/default-code-snippets.js`: dataset com trechos reais deste projeto (JS, CSS, HTML), carregado como `<script>` global (evita problemas de módulos ES6 sob `file://`).
- `js/content/practice-texts.js`: dataset com textos originais de prática em `en-us` e `pt-br` sobre QWERTY/datilografia.
- `js/domain/PracticeCategoryProvider.js`: novo componente de domínio, responsabilidade única de mapear categoria → dataset/comportamento (mostrar ou não o seletor de pasta).
- `index.html`: novo `<select id="categorySelect">` populado dinamicamente a partir do provider (evita duplicar a lista de categorias em HTML e JS).
- `texts/en-us/*.txt` e `texts/pt-br/*.txt`: arquivos reais gerados como entregável solicitado, com o mesmo conteúdo embutido no dataset JS.

# Fora de escopo

- Build/bundler (projeto não possui npm build); scripts continuam carregados via tags `<script>` simples.
- Tradução automática ou mais idiomas além de EN-US/PT-BR nesta iteração.

# Critérios de aceite

Ver critérios anexados ao card CD-002 no kanban.

