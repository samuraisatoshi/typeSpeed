# CD-011 — Lições de datilografia (mão esquerda/direita/alternância)


---
card_id: CD-011
status: grooming
---

# Contexto

Usuário observou que a lista de textos EN-US/PT-BR está pobre e perguntou por APIs de quotes/domínio público. Pesquisa (ver CD-012) mostrou que a única opção viável para os dois idiomas é Wikiquote (fica em card separado). Paralelamente, sugeriu usar conteúdo autoral: lições de datilografia estruturadas (mão esquerda, mão direita, alternância), como um professor de digitação ensinaria — sem dependência externa.

# Mapa de mãos QWERTY (US) usado para verificação

- Mão esquerda: `q w e r t` `a s d f g` `z x c v b`
- Mão direita: `y u i o p` `h j k l` `n m`

# Metodologia (importante — evita erro de "chute de memória")

Todas as listas de palavras foram geradas com um script Node que:
1. Filtra o dicionário do sistema (`/usr/share/dict/words`, ~236k palavras) por pertencer 100% a um conjunto de teclas.
2. Cruza com uma lista curada manualmente (palavras reconhecíveis do dia a dia) e **verifica programaticamente** cada uma contra o mapa de mãos — palavras que falharam na verificação foram descartadas (ex: "greasy", "weakest" pareciam mão-esquerda mas têm letra da mão direita).
3. Resultado: 87 palavras mão-esquerda, 37 mão-direita, 34 alternância — todas confirmadas.

# Escopo

EN-US apenas nesta v1. Palavras em PT-BR exigiriam mapear acentos do layout ABNT2 (ç, ã, õ, á etc. ficam em posições diferentes) — fora de escopo, possível melhoria futura.

# Design

- Novo arquivo `js/content/typing-drills.js`: `const TYPING_DRILLS = { 'left-hand': [...], 'right-hand': [...], 'alternating': [...] }`, cada categoria com 2 arquivos (aquecimento de sequências tipo home-row + lista de palavras), `language: 'Text'` (entra no wrap automático do CD-009 via CodeFileRepository.loadFromDataset).
- `PracticeCategoryProvider`: construtor ganha parâmetro `typingDrills`; `getCategories()` ganha 3 novas entradas; `getDataset()` ganha 3 novos `case`. Nenhuma outra classe muda (Open/Closed, já documentado no cabeçalho da classe).
- `TypingApp` (js/application/TypingApp.js): passa `TYPING_DRILLS` ao construir `PracticeCategoryProvider`.
- `index.html`: novo `<script src="js/content/typing-drills.js">` antes de `PracticeCategoryProvider.js`.

# Validação planejada

- Reexecutar o script de verificação de mãos sobre o conteúdo final (incluindo as sequências de aquecimento) antes de commitar.
- Teste end-to-end via Playwright: selecionar cada uma das 3 categorias, Start Typing, confirmar que carrega sem pasta/internet e que o wrap automático funciona.

