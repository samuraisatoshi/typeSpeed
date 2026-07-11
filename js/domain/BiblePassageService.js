// Domain service: fetches the exact text of a randomly picked Bible
// reference from bible-api.com in real time (no offline fallback dataset
// — a wrong/mocked passage would be worse than a clear error message).
class BiblePassageService {
    constructor(passageSelector) {
        this.passageSelector = passageSelector;
    }

    async fetchRandomPassage(categoryValue, maxAttempts = 5) {
        const translation = categoryValue === 'bible-pt-br' ? 'almeida' : 'web';
        let lastError = null;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const reference = this.passageSelector.pickReference();
            try {
                return await this.fetchReference(reference, translation, categoryValue);
            } catch (error) {
                // Some books have gaps in certain translations on bible-api.com
                // (e.g. 1/2 Peter and Revelation are missing from 'almeida').
                // Retrying with a fresh random reference is honest — it's still
                // real fetched text, never a mocked fallback — and keeps a
                // single missing book from breaking every session.
                lastError = error;
            }
        }

        throw new Error(`Não foi possível buscar uma passagem bíblica após ${maxAttempts} tentativas. Último erro: ${lastError.message}`);
    }

    async fetchReference(reference, translation, categoryValue) {
        const bookSlug = reference.book.toLowerCase().split(' ').join('+');
        const url = `https://bible-api.com/${bookSlug}+${reference.chapter}:${reference.verseStart}-${reference.verseEnd}?translation=${translation}`;

        const displayBook = categoryValue === 'bible-pt-br' ? reference.namePtBr : reference.book;
        const displayLabel = `${displayBook} ${reference.chapter}:${reference.verseStart}-${reference.verseEnd}`;

        let response;
        try {
            response = await fetch(url);
        } catch (networkError) {
            throw new Error(`Sem conexão com a internet para buscar "${displayLabel}".`);
        }

        if (!response.ok) {
            throw new Error(`bible-api.com retornou erro ${response.status} para "${displayLabel}".`);
        }

        const data = await response.json();
        if (!data || !data.text) {
            throw new Error(`Resposta inválida da API para "${displayLabel}".`);
        }

        const content = `${displayLabel}\n\n${this.flattenText(data.text)}`;

        return {
            name: `${displayLabel}.txt`,
            path: `bible/${categoryValue}/${displayLabel}`,
            language: 'Text',
            content
        };
    }

    flattenText(rawText) {
        return rawText.replace(/\s+/g, ' ').trim();
    }
}
