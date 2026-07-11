# CD-013 — Randomizar ordem das palavras nas lições de datilografia


---
card_id: CD-013
status: grooming
---

# Contexto

As listas de palavras dos drills (CD-011) sempre aparecem na mesma ordem fixa — usuário pode memorizar a sequência em vez de treinar digitação real.

# Design

- `js/shared/WordShuffler.js`: `static shuffle(text)` — Fisher-Yates (não sort-by-random, que é enviesado) sobre as palavras do último parágrafo do texto (preserva título + separador `\n\n`).
- `TYPING_DRILLS`: arquivos `02-*-words.txt` ganham `shuffleWords: true`. Arquivos `01-*-warmup.txt` NÃO ganham essa flag — a ordem progressiva das sequências é intencional.
- `TypingApp.startSession()`: após `getRandomFile()`, se `file.shuffleWords`, aplica `WordShuffler.shuffle(file.content)` para produzir o conteúdo do snippet — sem mutar `file.content` armazenado (novo shuffle a cada `startSession()`, cobrindo tanto o primeiro Start Typing quanto cada New Snippet subsequente).
- Nenhuma outra categoria é afetada (Bible/Quote/Texto/Código não têm a flag).

# Validação planejada

- Clicar Start Typing/New Snippet 3x na categoria mão-esquerda e confirmar ordens diferentes a cada vez (via Playwright).
- Confirmar aquecimento continua na ordem original.
- Confirmar Bible/Quote/Texto/Código inalterados.
