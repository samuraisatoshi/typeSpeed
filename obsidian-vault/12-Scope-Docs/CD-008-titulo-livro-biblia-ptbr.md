# CD-008 — Título do livro bíblico sempre em EN-US na categoria PT-BR


---
card_id: CD-008
status: review
---

# Contexto

Usuário reportou que, ao selecionar a categoria de prática bíblica em português (pt-br), o texto do versículo vem corretamente traduzido (Almeida), mas o título/cabeçalho exibido com o nome do livro + capítulo:versículo permanece sempre em inglês.

# Causa raiz

- `js/content/bible-books-meta.js`: `BIBLE_BOOKS_META` só tem um campo `name` por livro, sempre em inglês (ex: `Genesis`, `1 Samuel`, `Song of Solomon`).
- `js/domain/RandomBiblePassageSelector.js:25-31`: `pickReference()` monta `reference.label` a partir de `book.name` (inglês), sem conhecer o idioma da categoria selecionada.
- `js/domain/BiblePassageService.js:10`: `translation` (`almeida`/`web`) é escolhido corretamente para o **texto** do versículo.
- `js/domain/BiblePassageService.js:31`: `bookSlug` usa `reference.book` (inglês) para montar a URL da API — correto, bible-api.com espera slugs em inglês.
- `js/domain/BiblePassageService.js:50-54` (antes da correção): `content`/`name`/`path` reaproveitavam `reference.label` (inglês) como título, independente de `categoryValue`.

# Design implementado

- Adicionado campo `namePtBr` a cada entrada de `BIBLE_BOOKS_META` (js/content/bible-books-meta.js), com o nome do livro na tradução Almeida.
- `RandomBiblePassageSelector.pickReference()` passa a incluir `namePtBr: book.namePtBr` no objeto de referência retornado, sem alterar sua lógica de sorteio nem decidir qual nome usar.
- `BiblePassageService.fetchReference()` monta `displayBook`/`displayLabel` a partir de `categoryValue === 'bible-pt-br' ? reference.namePtBr : reference.book`, usado no título/conteúdo/nome do arquivo. `bookSlug` (URL da API) continua baseado exclusivamente em `reference.book` (inglês).

# Verificação

- Simulação Node (vm + fetch mockado), 5 rodadas: títulos pt-br em português, URLs sempre com slug em inglês.
- Teste end-to-end no navegador real (Playwright + servidor HTTP local): categoria "Bíblia — Português" exibiu "Provérbios 23:10-21" corretamente.

