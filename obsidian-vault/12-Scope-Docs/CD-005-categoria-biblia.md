# CD-005 — Categoria de prática "Bíblia"

---
card_id: CD-005
status: grooming
---

# Contexto

Usuário pediu uma categoria "Bíblia" no seletor de prática, no mesmo padrão das categorias de texto EN-US/PT-BR já existentes (CD-002), com seleção aleatória de passagem.

# Fonte do conteúdo

bible-api.com (sem chave, domínio público): tradução WEB (World English Bible) para inglês, tradução Almeida (João Ferreira de Almeida) para português. Ambas confirmadas com `translation_note: "Public Domain"` na resposta da API.

Passagens obtidas via WebFetch (texto verbatim, apenas re-quebrado em linhas de ~45-70 caracteres para leitura/digitação, sem alterar palavras):
- Salmo 23 / Psalm 23
- João 3:16-21 / John 3:16-21
- Gênesis 1:1-10 / Genesis 1:1-10

# Design

- Seguir exatamente o padrão de `js/content/practice-texts.js`, mas em arquivo separado `js/content/bible-texts.js` (responsabilidade única: um arquivo = um domínio de conteúdo).
- `PracticeCategoryProvider` recebe um terceiro parâmetro `bibleTexts` no construtor e ganha 2 novas entradas em `getCategories()`/`getDataset()`: `bible-en-us`, `bible-pt-br`.
- Seleção aleatória: nenhum código novo necessário — `CodeFileRepository.getRandomFile()` já escolhe aleatoriamente entre os itens do dataset carregado, mesmo mecanismo usado pelas categorias de código/texto existentes.

# Fora de escopo

- Chamada de rede em runtime (mantém o app offline via `file://`).
- Mais passagens/livros nesta iteração (fácil de estender depois, mesmo padrão).

