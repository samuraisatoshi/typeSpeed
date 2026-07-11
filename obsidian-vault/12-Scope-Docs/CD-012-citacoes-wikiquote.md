# CD-012 — Citações ao vivo via Wikiquote (EN-US/PT-BR)


---
card_id: CD-012
status: grooming
---

# Contexto

Pesquisa (conversa anterior, ver também descrição do card) confirmou: `quotable.io` morta, `zenquotes.io` sem CORS, `dummyjson.com` só inglês/dataset fixo. Única opção viável para os dois idiomas: **Wikiquote via API do MediaWiki** (`en.wikiquote.org`, `pt.wikiquote.org`), CORS liberado com `&origin=*`.

# Formato real da API (testado ao vivo, não assumido)

1. `action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*` → `data.query.random[0].title`
2. `action=query&prop=extracts&explaintext&titles=<title>&format=json&origin=*` → `data.query.pages[<id>].extract` (texto plano, wikitext removido)

**Achado importante**: o formato do extract varia MUITO por página (pessoa, filme, tópico, proviérbio) e a API **não preserva marcadores de lista** (`*`) que normalmente distinguiriam citação de fonte/referência — em muitas páginas clássicas (ex: testado com "Mark Twain"), citação e linha de fonte aparecem como linhas soltas consecutivas, sem prefixo distintivo. Ou seja: **não é possível separar citação de metadado com 100% de precisão** a partir só do extract. Heurística (não perfeita, documentada honestamente):

- Descarta linhas vazias, cabeçalhos (`==...==`), linhas iniciadas com `|`, `-`, `*`
- Descarta linhas curtas (<30 chars) ou muito longas (>500 chars)
- Descarta linhas que "parecem citação de fonte": contêm um ano (19xx/20xx) E não terminam em pontuação de frase real, OU terminam em `(YYYY)`
- Do que sobrar, sorteia uma linha

Limitação assumida: ocasionalmente pode sortear uma frase de biografia/introdução em vez de uma citação atribuída — ainda é texto real do Wikiquote, nunca conteúdo mockado/fabricado. Se NENHUMA linha sobreviver ao filtro (página de desambiguação/stub), a tentativa falha e sorteia outro artigo (até 5 tentativas, mesmo padrão do BiblePassageService), erro explícito se todas falharem.

# Design

- Novo `js/domain/QuotePassageService.js`: `fetchRandomPassage(categoryValue, maxAttempts=5)`, `pickRandomTitle(host)`, `fetchExtract(host, title, categoryValue)`, `extractQuoteLine(extract)`, `looksLikeCitation(line)`. host = `en.wikiquote.org` (quote-en-us) ou `pt.wikiquote.org` (quote-pt-br).
- `PracticeCategoryProvider`: 2 novas categorias (`quote-en-us`, `quote-pt-br`), `isLiveFetch()` passa a reconhecer também essas.
- `TypingApp`: como agora há DOIS serviços de live-fetch (Bíblia e Quote), `startSession()` precisa rotear para o serviço certo por categoria em vez de chamar `this.bibleService` fixo. Solução: mapa `{ categoryValue: service }` construído no construtor, `startSession()` busca o serviço pelo mapa.
- `index.html`: novo `<script src="js/domain/QuotePassageService.js">`.

# Validação planejada

- Teste end-to-end real via Playwright (categoria depende de internet, sem mock): selecionar quote-en-us e quote-pt-br, Start Typing, confirmar que busca e exibe conteúdo real.
- Confirmar que Bíblia continua funcionando após a mudança de roteamento em `startSession()` (sem regressão).
