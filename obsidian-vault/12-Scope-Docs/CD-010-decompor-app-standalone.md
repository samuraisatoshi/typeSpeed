# CD-010 — Decompor js/app-standalone.js e eliminar implementação duplicada


---
card_id: CD-010
status: grooming
---

# Contexto

`index.html` (entry point real, aberto direto via `file://` sem servidor — ver README) carrega `js/app-standalone.js`: um bundle monolítico de 1069 linhas com CodeFileRepository, Statistics, CodeSnippetSelector, UIController, InputHandler, TypingApp e TypingSession, todos como classes globais simples (sem import/export).

Já existe uma versão "modular" dessas MESMAS classes em `js/domain/*.js`, `js/application/*.js`, `js/infrastructure/*.js`, usando ES modules (`export class` / `import ... from`). Essa versão só é carregada por `index-modules.html` (não documentado no README, não é o entry point real).

# Achado crítico durante grooming

A versão modular está **defasada** — comparando `js/domain/TypingSession.js` (modular) com a classe equivalente em `app-standalone.js`, a versão modular NÃO tem nenhuma das correções dos cards CD-001 a CD-009 (sem PracticeCategoryProvider/BiblePassageService/RandomBiblePassageSelector, sem ParagraphReflow, sem normalização tipográfica, sem wrap-text). É código morto e obsoleto, não uma alternativa válida.

Além disso, ES modules via `import` de arquivos locais são bloqueados por CORS ao abrir `file://` diretamente (sem servidor) — provavelmente a razão pela qual `app-standalone.js` (bundle sem import/export) existe: permitir "Quick Start: apenas abra index.html" sem servidor, conforme README. Isso descarta simplesmente apontar `index.html` para os módulos ES existentes.

# Design

1. Fonte de verdade = conteúdo ATUAL de `app-standalone.js` (mantido e testado ao longo de 9 cards), não a versão modular obsoleta.
2. Extrair cada classe de `app-standalone.js` para seu arquivo modular correspondente (`js/domain/CodeFileRepository.js`, `Statistics.js`, `CodeSnippetSelector.js`, `TypingSession.js`, `js/application/TypingApp.js`, `UIController.js`, `js/infrastructure/InputHandler.js`), **sem** import/export — scripts globais simples, iguais ao estilo atual de `index.html`, compatíveis com `file://` sem servidor.
3. Atualizar `index.html`: substituir o único `<script src="js/app-standalone.js">` por um `<script>` por classe, na ordem de dependência (CodeFileRepository, Statistics, CodeSnippetSelector, TypingSession, InputHandler, UIController, TypingApp).
4. Remover `js/app-standalone.js` (conteúdo já distribuído).
5. `index-modules.html` fica quebrado por este refactor (os arquivos deixam de ter import/export) e já carregava a versão obsoleta — remover também, documentando a decisão no commit. Não há uso documentado desse entry point no README.
6. Cada arquivo resultante deve ficar ≤ 550 linhas (nenhuma classe individual de app-standalone.js chega perto disso).
7. Validação: testar TODAS as categorias (código padrão, pasta própria, Texto EN-US/PT-BR, Bíblia EN-US/PT-BR) via Playwright, abrindo `index.html` via servidor local (Playwright bloqueia file://) — comportamento deve ser idêntico ao atual.

