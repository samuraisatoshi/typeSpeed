// Structured touch-typing lessons that isolate hand/finger movement,
// the way a typing instructor would sequence practice: key-position
// warm-ups first, then real English words restricted to one hand's
// key set. QWERTY (US) hand map used throughout:
//   left  = q w e r t | a s d f g | z x c v b
//   right = y u i o p | h j k l   | n m
// Every warm-up sequence and word list was verified programmatically
// (Node script checking each token against the map above, cross-checked
// against /usr/share/dict/words) — nothing here is a memorized guess.
// EN-US only in this version: PT-BR words would need ABNT2 accent-key
// mapping, out of scope for now.
// Mirrors the .txt files under texts/drills/ (kept in sync manually) —
// same pattern as practice-texts.js. Content is embedded here (not
// fetched at runtime) because index.html is designed to open via
// file:// without a server, and fetch() of local files is blocked in
// that mode. Word-list files (not the warm-up sequences) are marked
// shuffleWords: true — TypingApp.startSession() reshuffles their word
// order via WordShuffler on every session so it isn't memorized by
// position.
const TYPING_DRILLS = {
    'left-hand': [
        {
            name: '01-home-row-warmup.txt',
            path: 'drills/left-hand/01-home-row-warmup.txt',
            language: 'Text',
            content: `Left Hand Warm-up

asdf asdf fdsa fdsa asdf fdsa dsaf dsaf

qwer qwer erwq erwq qwer twer

zxcv zxcv vcxz vcxz zxcv bxcv

asdf qwer zxcv asdf qwer zxcv`
        },
        {
            name: '02-left-hand-words.txt',
            path: 'drills/left-hand/02-left-hand-words.txt',
            language: 'Text',
            shuffleWords: true,
            content: `Left Hand Only — Real Words

water sweater greatest average beverage create created treated tested rested wasted dressed address addressed decrease decreased degrade degraded grease terrace cassette aggregate target targeted dragged tagged tracer tracers reserve reserved deserve deserved savage sewage garage garbage cabbage cascade cadaver exact exacted extract extracted exceed exceeded exert exerted gazette farce scarce scattered staggered sacred scared secreted tercet terraced decade assessed aggravated asserted adverse affected effaced deserted reward rewards sweetest sweated started stared teaser teasers ceased cease decease deceased retreated retreat freeware garages cabbages cascades decreases degrades aggregates targets`
        }
    ],
    'right-hand': [
        {
            name: '01-home-row-warmup.txt',
            path: 'drills/right-hand/01-home-row-warmup.txt',
            language: 'Text',
            content: `Right Hand Warm-up

jkl jkl lkj lkj jkl hjkl

yuio yuio oiuy oiuy yuio puio

nm nm mn mn hjkl nm

jkl yuio nm jkl yuio nm`
        },
        {
            name: '02-right-hand-words.txt',
            path: 'drills/right-hand/02-right-hand-words.txt',
            language: 'Text',
            shuffleWords: true,
            content: `Right Hand Only — Real Words

milk hill hook pinky mommy puppy lily holy hymn phony minion million onion opinion pinup unholy monopoly poplin nylon pinion hominy poppy lumpy jumpy hilly phylum moon noon loop pool polio opium unlink unhook kimono onlook hookup`
        }
    ],
    'alternating': [
        {
            name: '01-cross-hand-warmup.txt',
            path: 'drills/alternating/01-cross-hand-warmup.txt',
            language: 'Text',
            content: `Alternating Hands Warm-up

fj fj dk dk sl sl aj aj

fj dk sl aj fj dk sl aj

jf kd ls ja jf kd ls ja`
        },
        {
            name: '02-alternating-words.txt',
            path: 'drills/alternating/02-alternating-words.txt',
            language: 'Text',
            shuffleWords: true,
            content: `Alternating Hands — Real Words

the with when profit amend field right eight shape chair problem formal authentic chairman downtown title handle ancient element signal endow ivory sight social handy visual usual eighth enrich civic vigor widow envy amendment`
        }
    ]
};

