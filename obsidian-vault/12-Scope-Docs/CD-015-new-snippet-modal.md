# CD-015 — "New Snippet" no modal não inicia nova sessão


---
card_id: CD-015
status: grooming
---

# Contexto

Usuário reportou (com screenshot) que o botão "New Snippet" do modal de resultados não inicia nova sessão — só fecha o modal.

# Causa raiz

`js/app-bootstrap.js#newSnippetFromModal()`:
```js
function newSnippetFromModal() {
    closeResultsModal();
    const newSnippetBtn = document.getElementById('newSnippetBtn');
    if (newSnippetBtn) {
        newSnippetBtn.click();
    }
}
```
`'newSnippetBtn'` não existe em `index.html`. O botão real é `id="startBtn"` (texto muda para "New Snippet" via `UIController.setStartButtonText`, mas o ID nunca muda). `getElementById` retorna `null`, o `if` falha silenciosamente — bug pré-existente, já estava assim em `app-standalone.js` antes do CD-010 (não introduzido nesta sessão).

# Correção

Trocar `'newSnippetBtn'` por `'startBtn'` em `newSnippetFromModal()`.

# Validação planejada

Playwright: completar uma sessão (digitar o snippet inteiro), clicar "New Snippet" no modal, confirmar que uma nova sessão começa imediatamente (novo snippet exibido, métricas zeradas, sem precisar de segundo clique). Confirmar também que "OK" continua só fechando o modal.
