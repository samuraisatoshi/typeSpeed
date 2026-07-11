// Shared utility: shuffles the words in the last paragraph of a piece of
// text (Fisher-Yates — sort-by-random-comparator is biased and must not
// be used here), preserving any leading title/paragraph structure before
// it. Used so repeated word-list drills (see typing-drills.js) don't
// become memorized by position across sessions.
class WordShuffler {
    static shuffle(text) {
        const paragraphs = text.split('\n\n');
        const lastIndex = paragraphs.length - 1;
        const words = paragraphs[lastIndex].split(' ').filter(Boolean);

        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }

        paragraphs[lastIndex] = words.join(' ');
        return paragraphs.join('\n\n');
    }
}

