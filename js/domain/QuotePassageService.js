// Domain service: fetches a random quote from Wikiquote (MediaWiki API)
// in real time (no offline fallback dataset — a wrong/mocked quote would
// be worse than a clear error message). Mirrors BiblePassageService's
// retry-on-gap pattern: many randomly picked Wikiquote pages are stubs,
// disambiguation pages, or have no line that survives the quote filter
// — retrying with a fresh random pick is honest, never a mocked fallback.
class QuotePassageService {
    async fetchRandomPassage(categoryValue, maxAttempts = 5) {
        const host = categoryValue === 'quote-pt-br' ? 'pt.wikiquote.org' : 'en.wikiquote.org';
        let lastError = null;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const title = await this.pickRandomTitle(host);
                return await this.fetchQuote(host, title, categoryValue);
            } catch (error) {
                lastError = error;
            }
        }

        throw new Error(`Não foi possível buscar uma citação após ${maxAttempts} tentativas. Último erro: ${lastError.message}`);
    }

    async pickRandomTitle(host) {
        const url = `https://${host}/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*`;

        let response;
        try {
            response = await fetch(url);
        } catch (networkError) {
            throw new Error(`Sem conexão com a internet para sortear um artigo em ${host}.`);
        }

        if (!response.ok) {
            throw new Error(`${host} retornou erro ${response.status} ao sortear um artigo.`);
        }

        const data = await response.json();
        const page = data?.query?.random?.[0];
        if (!page || !page.title) {
            throw new Error(`Resposta inválida de ${host} ao sortear um artigo.`);
        }
        return page.title;
    }

    async fetchQuote(host, title, categoryValue) {
        const url = `https://${host}/w/api.php?action=query&prop=extracts&explaintext&titles=${encodeURIComponent(title)}&format=json&origin=*`;

        let response;
        try {
            response = await fetch(url);
        } catch (networkError) {
            throw new Error(`Sem conexão com a internet para buscar "${title}".`);
        }

        if (!response.ok) {
            throw new Error(`${host} retornou erro ${response.status} para "${title}".`);
        }

        const data = await response.json();
        const pages = data?.query?.pages;
        const page = pages && Object.values(pages)[0];
        const quote = this.extractQuoteLine(page?.extract);

        if (!quote) {
            throw new Error(`"${title}" não contém uma citação utilizável (página de desambiguação ou stub).`);
        }

        const content = `${title}\n\n${quote}`;

        return {
            name: `${title}.txt`,
            path: `quote/${categoryValue}/${title}`,
            language: 'Text',
            content
        };
    }

    // Best-effort heuristic, not perfect: Wikiquote's explaintext output
    // drops the bullet-list structure that would otherwise distinguish a
    // quote from its source citation, so some pages yield indistinguishable
    // plain lines for both. Filters out headers/citation-shaped lines and
    // picks randomly among what's left — still real Wikiquote text, never
    // fabricated, even if occasionally a citation or bio line slips through.
    extractQuoteLine(extract) {
        if (!extract) return null;

        const candidates = extract
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length >= 30 && line.length <= 500)
            .filter(line => !line.startsWith('=='))
            .filter(line => !/^[|*-]\s/.test(line))
            .filter(line => !/^(cited by|source|fonte|see also)[:\s]/i.test(line))
            .filter(line => !this.looksLikeCitation(line));

        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    looksLikeCitation(line) {
        if (/\(\d{4}\)\s*$/.test(line)) return true;
        const hasYear = /\b(1[5-9]\d{2}|20[0-2]\d)\b/.test(line);
        const endsLikeSentence = /[.!?"”’]$/.test(line);
        return hasYear && !endsLikeSentence;
    }
}

