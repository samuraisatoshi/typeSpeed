# CD-006 — Bíblia: busca aleatória real por sessão

---
card_id: CD-006
status: grooming
---

# Contexto

O CD-005 entregou 3 passagens fixas (Salmo 23, João 3, Gênesis 1) embutidas estaticamente. Usuário esclareceu que quer variação real: sortear livro/capítulo/versículo a cada sessão, usando uma tabela de metadados (nú capitulos e versículos por capítulo) para gerar uma referência válida, buscando o texto exato via API no momento.

# Fonte dos metadados

Dataset público `bkuhl/bible-verse-counts-per-chapter` (github, raw JSON baixado via curl para fidelidade numérica — não resumido por IA): 66 livros, cada um com array de versículos por capítulo. Verificado: Genesis 50 capítulos, capítulo 1 = 31 versículos (confere com o texto bíblico conhecido).

Confirmado via WebFetch real que bible-api.com aceita o slug em inglês (minúsculo, espaços viram `+`) para QUALQUER tradução, incluindo livros numéricos ("1+corinthians") e compostos ("song+of+solomon") — cobertura dos 66 livros sem exceções.

# Design

- `js/content/bible-books-meta.js`: `BIBLE_BOOKS_META` — array de `{name, chapters: [versosPorCapitulo...]}`.
- `js/domain/RandomBiblePassageSelector.js`: sorteia livro → capítulo (usando nº real de capítulos do livro) → intervalo de versículos (usando nº real de versículos do capítulo sorteado). Sem isso, poderíamos sortear um versículo inexistente.
- `js/domain/BiblePassageService.js`: constrói a URL (`https://bible-api.com/{livro}+{cap}:{v1}-{v2}?translation=web|almeida`), busca via `fetch()`, lança erro explícito se falhar (sem fallback silencioso).
- `TypingApp.startSession()`: para categorias `bible-*`, faz `await` do fetch antes de montar a sessão; trata erro com mensagem clara ao usuário (sem internet / API fora do ar), sem quebrar as demais categorias offline.
- Isso torna a categoria Bíblia dependente de rede — diferente das demais categorias (que continuam 100% offline). Vamos comunicar isso na UI.

# Fora de escopo

- Cache local de passagens já buscadas (possível melhoria futura).
- Suporte a outras traduções/idiomas além de WEB/Almeida nesta iteração.

