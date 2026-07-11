// Shared utility: rewrites "typographic" Unicode punctuation (curly quotes,
// em/en dashes, ellipsis, non-breaking space) into the plain-ASCII
// characters an actual keyboard can produce. Practice text pulled from
// external sources (e.g. the live Bible fetch) often uses these stylistic
// variants, which otherwise sit in the snippet as permanently-uncatchable
// characters. Real accented letters (á, é, ç, ã, ú...) are left untouched
// — those are typable via dead keys (see InputHandler's compositionend
// handling) and are not a "typographic" substitution.
class TypableTextNormalizer {
    static normalize(text) {
        if (!text) return text;
        return text
            .replace(/[‘’‚‛′‵]/g, "'")
            .replace(/[“”„‟«»″‶]/g, '"')
            .replace(/[–—]/g, '-')
            .replace(/…/g, '...')
            .replace(/ /g, ' ');
    }
}

