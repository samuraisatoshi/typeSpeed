// Domain service: single responsibility of picking a VALID random Bible
// reference (book + chapter + verse range) using the real chapter/verse
// counts in BIBLE_BOOKS_META. Without those counts we could ask for a
// verse that doesn't exist (e.g. verse 40 of a 10-verse chapter).
class RandomBiblePassageSelector {
    constructor(booksMeta) {
        this.booksMeta = booksMeta || [];
    }

    pickReference(minVerses = 6, maxVerses = 14) {
        if (this.booksMeta.length === 0) {
            throw new Error('BIBLE_BOOKS_META está vazio — não é possível sortear uma passagem.');
        }

        const book = this.booksMeta[Math.floor(Math.random() * this.booksMeta.length)];
        const chapterIndex = Math.floor(Math.random() * book.chapters.length);
        const chapterNumber = chapterIndex + 1;
        const verseCount = book.chapters[chapterIndex];

        const span = Math.min(verseCount, minVerses + Math.floor(Math.random() * (maxVerses - minVerses + 1)));
        const maxStart = Math.max(1, verseCount - span + 1);
        const verseStart = Math.floor(Math.random() * maxStart) + 1;
        const verseEnd = Math.min(verseCount, verseStart + span - 1);

        return {
            book: book.name,
            namePtBr: book.namePtBr,
            chapter: chapterNumber,
            verseStart,
            verseEnd,
            label: `${book.name} ${chapterNumber}:${verseStart}-${verseEnd}`
        };
    }
}

