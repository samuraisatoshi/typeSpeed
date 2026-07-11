# CD-009 — Wrap de linha força ENTER indevido em textos/Bíblia


---
card_id: CD-009
status: grooming
---

# Contexto

Usuário reportou: nas categorias de texto contínuo (Bíblia e Textos EN-US/PT-BR), toda quebra de linha exige um ENTER, mesmo quando é apenas uma quebra visual de largura (~65-70 colunas), não um fim de parágrafo real.

# Causa raiz

- `InputHandler.onEnter` mapeia a tecla Enter para o char `'\n'` (js/app-standalone.js:737) — todo `'\n'` no conteúdo exige uma tecla Enter.
- `BiblePassageService.wrapText()` recorta `data.text` em linhas de até 68 colunas inserindo `'\n'` artificial — nenhuma dessas quebras é fim de parágrafo real.
- `js/content/practice-texts.js`: os textos `PRACTICE_TEXTS` já vêm hard-wrapped manualmente (~65-70 colunas), misturando quebras de wrap com quebras reais de parágrafo (linha em branco).
- `css/styles.css:534` `.code-display { white-space: pre; overflow-x: auto; }` não faz wrap visual — depende 100% dos `'\n'` artificiais.

# Design implementado

- Novo utilitário de domínio `js/shared/ParagraphReflow.js`: `static reflow(text)` — separa o texto em parágrafos por linha-em-branco (`/\n\s*\n/`), colapsa quebras internas de cada parágrafo em espaço, e rejunta os parágrafos com `\n\n` real. Preserva SOMENTE quebras de parágrafo genuínas.
- `BiblePassageService.wrapText()` simplificado (renomeado para `flattenText`): apenas normaliza espaços em branco (`replace(/\s+/g, ' ').trim()`), sem recorte artificial por largura. O separador título/corpo (`\n\n`) continua sendo a única quebra real da passagem bíblica.
- `CodeFileRepository.loadFromDataset()` (único ponto que já aplica `TypableTextNormalizer`, ver CD-007): quando `f.language === 'Text'`, aplica também `ParagraphReflow.reflow()` após a normalização — cobre tanto Bíblia quanto Textos EN-US/PT-BR num único ponto, sem tocar em arquivos de código (`language !== 'Text'`).
- CSS: nova regra `.code-display.wrap-text { white-space: pre-wrap; overflow-wrap: break-word; overflow-x: hidden; }`, aplicada via `UIController.displayCode(code, isTextMode)` alternando a classe `wrap-text` no container quando `file.language === 'Text'`. Código mantém `white-space: pre` + scroll horizontal, sem regressão.

# Verificação planejada

- Teste end-to-end no navegador (Playwright): categoria Bíblia PT-BR e Texto EN-US, redimensionar viewport estreito e confirmar wrap automático sem letras marcadas como pendentes de Enter no meio do parágrafo.
- Confirmar que categoria de código padrão continua exigindo Enter nas quebras reais de linha do código (sem regressão).
