# CD-014 — Enter duplo entre grupos do aquecimento dos drills


---
card_id: CD-014
status: grooming
---

# Contexto

Usuário reportou (com screenshot) que nas lições de datilografia (CD-011), o arquivo de aquecimento exige 2 Enters seguidos entre grupos de sequência — o segundo numa linha totalmente vazia, sem propósito.

# Causa raiz

`ParagraphReflow` (CD-009) trata QUALQUER linha em branco (`\n\n`) como fim de parágrafo real, preservando ambos os `\n`. Isso faz sentido pra prosa corrida (título\n\ncorpo em Bíblia/Quote/Texto), mas os arquivos de aquecimento (`01-*-warmup.txt`) têm múltiplos grupos curtos separados por linha em branco — cada transição vira 2 Enters em vez de 1.

# Design

- Arquivos de warmup ganham `preserveLineBreaks: true` em `TYPING_DRILLS`.
- `CodeFileRepository.loadFromDataset()`: pula `ParagraphReflow.reflow()` quando `f.preserveLineBreaks` for true (mantém `TypableTextNormalizer.normalize()` normalmente).
- Conteúdo dos 3 arquivos de warmup: título separado do primeiro grupo por `\n\n` (mantém o padrão título/corpo, 1x só), mas os grupos entre si passam a usar `\n` simples (1 Enter por transição).
- Arquivos de lista de palavras (`02-*-words.txt`) e demais categorias NÃO ganham essa flag — comportamento inalterado.
- Atualizar espelhos em `texts/drills/*/01-*-warmup.txt`.

# Validação planejada

- Playwright: contar spans `.char.newline` no arquivo de aquecimento de cada categoria e confirmar que não há duas quebras consecutivas (i.e., nenhum par de `.newline` adjacentes sem caractere real entre eles, exceto a única transição título→corpo).
- Confirmar lista de palavras e Biblia/Quote/Texto inalterados.
