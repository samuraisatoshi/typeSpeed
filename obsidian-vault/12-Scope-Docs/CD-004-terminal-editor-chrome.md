# CD-004 — Nova identidade visual: Terminal/Editor Chrome

---
card_id: CD-004
status: grooming
---

# Contexto

Usuário achou a UI atual "old-school", parecida com "markdown colorido" (cards com gradiente roxo, emojis como ícones, pills coloridas). Pediu algo mais moderno, com menos emojis e mais SVG icons.

Apresentadas 3 direções de design (AskUserQuestion); usuário escolheu **Terminal/Editor Chrome**.

# Tokens de design

**Cores** (dark, quase-preto):
- `--bg-void: #0d1117` — fundo da página
- `--bg-surface: #161b22` — painéis/janela do editor
- `--bg-inset: #010409` — áreas recuadas (code display, status bar)
- `--border-hairline: #30363d` — divisores/chrome
- `--text-primary: #e6edf3`
- `--text-muted: #7d8590`
- `--accent-amber: #f0b429` — cor de assinatura única (cursor, primário, foco, aba ativa)
- `--accent-green: #3fb950` — correto/sucesso
- `--accent-red: #f85149` — incorreto/erro/destrutivo

**Tipografia**: monoespaçada (`'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace`) aplicada globalmente — títulos, botões, labels, não só code-display. Esse é o elemento de identidade: a UI inteira parece rodar dentro de um editor.

**Layout — assinatura**: área de prática envolvida por chrome de janela (barra de título com ●●● + nome do arquivo atual), barra de status inferior estilo VS Code substituindo os cards de métricas.

# Fora de escopo

- Reescrita de copy/textos (mantém idioma/mensagens atuais, exceto trocar emoji por SVG onde o emoji era usado como ícone funcional).
- Novas funcionalidades — isto é puramente apresentacional (CSS/HTML/pequenos ajustes de JS para popular os novos elementos).
- map_domain.json não precisa de novas entradas (nenhuma classe/domínio novo, apenas UI).

