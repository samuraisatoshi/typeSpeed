# CD-003 — Corrigir captura de teclas mortas (^ e acentos)

---
card_id: CD-003
status: grooming
---

# Contexto

Usuário reportou que o símbolo `^` não pode ser digitado durante a prática. Causa raiz: `InputHandler.attachTo()` (js/app-standalone.js, classe InputHandler) escuta apenas o evento `input` e limpa `e.target.value = ''` a cada disparo, sem verificar `e.isComposing`. Em layouts de teclado onde `^` é uma dead key (ABNT2 PT-BR, US-International), o navegador dispara eventos de composição (`compositionstart`/`compositionupdate`/`compositionend`) antes de confirmar o caractere final. Limpar o valor durante esse processo quebra a composição e o caractere nunca é emitido.

# Correção proposta

- Ignorar o evento `input` enquanto `e.isComposing === true`.
- Capturar o caractere final no evento `compositionend` (usando `e.data` ou `e.target.value`).
- Manter o comportamento atual de Backspace/Enter no `keydown` inalterado.

# Fora de escopo

- Suporte a IME de composição multi-caractere (chinês/japonês) — fora do domínio de prática de código em teclado QWERTY latino.

