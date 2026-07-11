# CD-001 — Otimização de FX (animações) e revisão de UX/UI no TypeSpeed

---
card_id: CD-001
status: grooming
---

# Contexto

Usuário relatou excesso de efeitos visuais/animações ("over FX") atrapalhando o fluxo de digitação no TypeSpeed. Análise de UX/UI conduzida pelo agente `ui-architect` sobre `css/styles.css`, `js/app-standalone.js`, `js/application/UIController.js` e `js/application/TypingApp.js`.

# Problemas identificados (alta prioridade)

1. **Cursor com pulse+blink simultâneos** — `css/styles.css:334-394`. Duas animações (`pulse`, `blink`) + dois `box-shadow` com blur disparando a cada tecla, causando repaint caro e efeito estroboscópico.
2. **Scroll suave a cada tecla** — `js/app-standalone.js:549-566`. `scrollIntoView({behavior:'smooth'})` chamado a cada keystroke, competindo com renderização em digitação rápida (70+ WPM).
3. **Re-query de DOM a cada tecla** — `js/app-standalone.js:534-547`. `querySelectorAll('.char')` executado múltiplas vezes por tecla, O(n²) ao longo da sessão.
4. **Falta de `prefers-reduced-motion`** — nenhuma consideração de acessibilidade para sensibilidade a movimento (WCAG 2.1 - 2.3.3).

# Problemas identificados (média prioridade)

5. Timer com `setInterval` a 100ms quando só exibe granularidade de segundos (`js/app-standalone.js:816-820`).
6. `transition: all` em botões — antipattern, anima propriedades não intencionais.
7. Contraste insuficiente no tema escuro (`#64748b` em `#1e293b` = 3.8:1, abaixo de WCAG AA).
8. Excesso de métricas simultâneas competindo por atenção durante a digitação.

# Fora de escopo (nesta iteração)

- Shake animation em erros, barra de progresso visual, controle de tamanho de fonte, mensagens de erro customizadas — tratados como baixa prioridade / backlog futuro.

# Critérios de aceite

Ver critérios anexados ao card CD-001 no kanban.

# Referências

- Domain map do workspace `typespeed` indexado (297 entidades, 513 relações) para análise de impacto antes de cada ajuste.

