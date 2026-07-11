# CD-007 — Normalizar pontuação tipográfica

---
card_id: CD-007
status: grooming
---

# Contexto

Usuário reportou (com screenshot) um caractere de aspas estilizado destacado em vermelho (incorreto/impossivel de digitar) durante prática com texto bíblico. Confirmado via teste real contra bible-api.com: aspas curvas “” (U+201C/201D) e apóstrofo curvo ’ (U+2019) aparecem tanto na tradução WEB (inglês) quanto Almeida (português), além de espaço não-quebrável (U+00A0).

# Distinção importante

Acentuação real (á, é, ç, ã, ú) NÃO deve ser tocada — já é digitável via dead keys (CD-003). Só normalizar pontuação tipográfica que substitui um caractere ASCII simples por uma variante estilística Unicode.

# Design

- `js/shared/TypableTextNormalizer.js`: método estático `normalize(text)` mapeando aspas curvas→retas, apóstrofo curvo→reto, nbsp→espaço normal, travessão em/en→hifen, reticências→três pontos.
- Aplicado em `CodeFileRepository.loadFromFileList()` e `loadFromDataset()` — ponto único que cobre TODAS as fontes de conteúdo (pasta do usuário, datasets embutidos, busca ao vivo da Bíblia).

